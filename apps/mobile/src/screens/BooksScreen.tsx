import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Text,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { booksApi, SearchBook } from '../api/books';
import { ExpenseTypeColors, BackgroundColors, TextColors } from '../constants/colors';

interface Book {
  id: number;
  title: string;
  author: string | null;
  cover_url: string | null;
  summary: string | null;
  key_takeaways: string | null;
  order_index: number;
  user_progress: {
    status: 'not_started' | 'in_progress' | 'done';
    progress_percent: number;
    started_at: string | null;
    completed_at: string | null;
  } | null;
}

const { width } = Dimensions.get('window');

export default function BooksScreen() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [languageChangeKey, setLanguageChangeKey] = useState(0);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>({
    total_books: 0,
    not_started: 0,
    in_progress: 0,
    completed: 0,
    completion_rate: 0,
    average_progress: 0,
    total_time_minutes: 0,
    reading_streak: 0,
    recent_activity: null,
    achievements: [],
  });
  
  // Add Book Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'manual'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchBook[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<SearchBook | null>(null);
  
  // Manual Entry States
  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthor, setManualAuthor] = useState('');
  const [manualPages, setManualPages] = useState('');
  const [manualChapters, setManualChapters] = useState('');
  
  // Status Filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'in_progress' | 'done'>('all');
  
  // Creating Book
  const [creatingBook, setCreatingBook] = useState(false);

  const loadBooks = async () => {
    try {
      const [booksData, statsData] = await Promise.all([
        booksApi.getBooks(),
        booksApi.getReadingStats(),
      ]);
      setBooks(booksData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load books:', error);
      Alert.alert(t('error'), t('failedToLoadBooks'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadBooks();
    }, [])
  );

  // Listen for language changes and force re-render
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageChangeKey(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadBooks();
  };

  // Search books from Open Library
  const handleSearchBooks = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await booksApi.searchBooks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert(t('error'), 'Failed to search books');
    } finally {
      setSearching(false);
    }
  };

  // Add book from search result
  const addBookFromSearch = async () => {
    if (!selectedBook) return;

    setCreatingBook(true);
    try {
      const coverUrl = selectedBook.cover_i
        ? `https://covers.openlibrary.org/b/id/${selectedBook.cover_i}-M.jpg`
        : undefined;

      const author = selectedBook.author_name?.join(', ') || '';
      const pages = selectedBook.number_of_pages || 0;

      await booksApi.createBook({
        title: selectedBook.title,
        author,
        cover_url: coverUrl,
        total_pages: pages,
      });

      Alert.alert(t('success'), `"${selectedBook.title}" added to your library!`);
      setShowAddModal(false);
      resetForm();
      loadBooks();
    } catch (error) {
      console.error('Failed to add book:', error);
      Alert.alert(t('error'), 'Failed to add book');
    } finally {
      setCreatingBook(false);
    }
  };

  // Add manual book entry
  const addManualBook = async () => {
    if (!manualTitle.trim()) {
      Alert.alert(t('error'), 'Book title is required');
      return;
    }

    setCreatingBook(true);
    try {
      await booksApi.createBook({
        title: manualTitle,
        author: manualAuthor || undefined,
        total_pages: manualPages ? parseInt(manualPages) : undefined,
        chapters: manualChapters ? parseInt(manualChapters) : undefined,
      });

      Alert.alert(t('success'), `"${manualTitle}" added to your library!`);
      setShowAddModal(false);
      resetForm();
      loadBooks();
    } catch (error) {
      console.error('Failed to add book:', error);
      Alert.alert(t('error'), 'Failed to add book');
    } finally {
      setCreatingBook(false);
    }
  };

  const resetForm = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedBook(null);
    setManualTitle('');
    setManualAuthor('');
    setManualPages('');
    setManualChapters('');
    setActiveTab('search');
  };

  // Filter books by status
  const getFilteredBooks = () => {
    if (statusFilter === 'all') return books;
    return books.filter((book) => (book.user_progress?.status || 'not_started') === statusFilter);
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'done':
        return '#000';
      case 'in_progress':
        return '#000';
      case 'not_started':
      default:
        return '#999';
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'done':
        return 'checkmark-circle';
      case 'in_progress':
        return 'book';
      case 'not_started':
      default:
        return 'book-outline';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getAchievementInfo = (achievement: string) => {
    const achievements: { [key: string]: { icon: string; label: string; color: string } } = {
      first_book: { icon: 'star', label: 'First Book', color: '#FFD700' },
      five_books: { icon: 'star', label: '5 Books', color: '#C0C0C0' },
      ten_books: { icon: 'star', label: '10 Books', color: '#CD7F32' },
      master_reader: { icon: 'medal', label: 'Master Reader', color: '#FF6B35' },
      week_streak: { icon: 'flame', label: '7 Day Streak', color: '#FF4500' },
      month_streak: { icon: 'flame', label: '30 Day Streak', color: '#FF0000' },
    };
    return achievements[achievement] || { icon: 'star', label: achievement, color: '#000' };
  };

  const renderBook = (book: Book) => {
    const status = book.user_progress?.status || 'not_started';
    const progress = book.user_progress?.progress_percent || 0;

    const handleLogSession = () => {
      Alert.prompt(
        'Log Reading Session',
        'How many pages did you read?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Next',
            onPress: (pages) => {
              if (pages) {
                Alert.prompt(
                  'Time Spent',
                  'How many minutes did you spend reading?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Add Session',
                      onPress: async (minutes) => {
                        if (minutes) {
                          try {
                            await booksApi.addReadingSession(book.id, {
                              pages_read: parseInt(pages),
                              time_spent_minutes: parseInt(minutes),
                            });
                            Alert.alert('Success', 'Reading session logged!');
                            loadBooks();
                          } catch (error) {
                            Alert.alert('Error', 'Failed to log session');
                          }
                        }
                      },
                    },
                  ],
                  'plain-text'
                );
              }
            },
          },
        ],
        'plain-text'
      );
    };

    return (
      <View key={book.id} style={styles.bookCard}>
        <TouchableOpacity onPress={() => navigation.navigate('BookDetail' as never, { bookId: book.id } as never)}>
          <View style={styles.bookHeader}>
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>
                {book.title}
              </Text>
              {book.author && (
                <Text style={styles.bookAuthor}>
                  {book.author}
                </Text>
              )}
            </View>
            <Ionicons
              name={getStatusIcon(status) as any}
              size={32}
              color={getStatusColor(status)}
            />
          </View>

          {status !== 'not_started' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {progress}%
              </Text>
            </View>
          )}

          {book.summary && (
            <Text
              style={styles.bookSummary}
              numberOfLines={2}
            >
              {book.summary}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.bookActions}>
          <TouchableOpacity 
            style={styles.readPdfBtn}
            onPress={() => navigation.navigate('PDFReader' as never, { bookId: book.id, bookTitle: book.title } as never)}
          >
            <Ionicons name="document" size={14} color="#fff" />
            <Text style={styles.readPdfBtnText}>{t('read') || 'Read'}</Text>
          </TouchableOpacity>
          
          {status === 'in_progress' && (
            <TouchableOpacity 
              style={styles.logSessionBtn}
              onPress={handleLogSession}
            >
              <Ionicons name="add-circle" size={14} color="#fff" />
              <Text style={styles.logSessionBtnText}>Log Reading</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </View>
    );
  }

  const filteredBooks = getFilteredBooks();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <Text style={styles.title}>
              📚 Books
            </Text>
            <Text style={styles.subtitle}>
              {t('booksSubtitle')}
            </Text>
          </View>
        </View>

        {/* STATUS FILTER */}
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[
              styles.filterBtn,
              statusFilter === 'all' && styles.filterBtnActive
            ]}
            onPress={() => setStatusFilter('all')}
          >
            <Text style={[
              styles.filterBtnText,
              statusFilter === 'all' && styles.filterBtnTextActive
            ]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterBtn,
              statusFilter === 'not_started' && styles.filterBtnActive
            ]}
            onPress={() => setStatusFilter('not_started')}
          >
            <Text style={[
              styles.filterBtnText,
              statusFilter === 'not_started' && styles.filterBtnTextActive
            ]}>Not Started</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterBtn,
              statusFilter === 'in_progress' && styles.filterBtnActive
            ]}
            onPress={() => setStatusFilter('in_progress')}
          >
            <Text style={[
              styles.filterBtnText,
              statusFilter === 'in_progress' && styles.filterBtnTextActive
            ]}>Reading</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterBtn,
              statusFilter === 'done' && styles.filterBtnActive
            ]}
            onPress={() => setStatusFilter('done')}
          >
            <Text style={[
              styles.filterBtnText,
              statusFilter === 'done' && styles.filterBtnTextActive
            ]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* PRIMARY STATS CARD */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.completed}
              </Text>
              <Text style={styles.statLabel}>
                {t('completed')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.in_progress}
              </Text>
              <Text style={styles.statLabel}>
                {t('inProgress')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.completion_rate}%
              </Text>
              <Text style={styles.statLabel}>
                {t('completionRate')}
              </Text>
            </View>
          </View>
        </View>

        {/* ENHANCED METRICS */}
        <View style={styles.metricsGrid}>
          {/* Time Spent Reading */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="time" size={20} color="#000" />
              <Text style={styles.metricTitle}>Time Spent</Text>
            </View>
            <Text style={styles.metricValue}>
              {formatTime(stats.total_time_minutes)}
            </Text>
          </View>

          {/* Reading Streak */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="flame" size={20} color="#FF6B35" />
              <Text style={styles.metricTitle}>Reading Streak</Text>
            </View>
            <Text style={styles.metricValue}>
              {stats.reading_streak} {stats.reading_streak === 1 ? 'day' : 'days'}
            </Text>
          </View>

          {/* Average Progress */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="bar-chart" size={20} color="#000" />
              <Text style={styles.metricTitle}>Avg Progress</Text>
            </View>
            <Text style={styles.metricValue}>
              {stats.average_progress}%
            </Text>
          </View>

          {/* Books Not Started */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="bookmark-outline" size={20} color="#999" />
              <Text style={styles.metricTitle}>Not Started</Text>
            </View>
            <Text style={styles.metricValue}>
              {stats.not_started}
            </Text>
          </View>
        </View>

        {/* ACHIEVEMENTS SECTION */}
        {stats.achievements.length > 0 && (
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>🏆 Achievements</Text>
            <View style={styles.achievementsGrid}>
              {stats.achievements.map((achievement: string) => {
                const info = getAchievementInfo(achievement);
                return (
                  <View key={achievement} style={styles.achievementBadge}>
                    <Ionicons name={info.icon as any} size={24} color={info.color} />
                    <Text style={styles.achievementLabel}>{info.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* RECENT ACTIVITY */}
        {stats.recent_activity && (
          <View style={styles.recentActivityCard}>
            <View style={styles.recentActivityHeader}>
              <Ionicons name="history" size={20} color="#000" />
              <Text style={styles.sectionTitle}>Recent Activity</Text>
            </View>
            <View style={styles.recentActivityContent}>
              <Text style={styles.recentBookTitle}>{stats.recent_activity.book_title}</Text>
              <View style={styles.recentActivityMeta}>
                <Ionicons
                  name={getStatusIcon(stats.recent_activity.status) as any}
                  size={16}
                  color={getStatusColor(stats.recent_activity.status)}
                />
                <Text style={styles.recentActivityStatus}>
                  {stats.recent_activity.progress_percent}% • {new Date(stats.recent_activity.updated_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* STATS BREAKDOWN WITH EXPENSE TYPE COLORS */}
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>📊 Reading Breakdown</Text>
          
          {/* Visual Stacked Bar Chart */}
          <View style={styles.stackedBarContainer}>
            <View style={styles.stackedBar}>
              {/* Completed (Mandatory - Blue) */}
              {stats.completed > 0 && (
                <View
                  style={[
                    styles.stackedBarSegment,
                    {
                      width: `${(stats.completed / stats.total_books) * 100}%`,
                      backgroundColor: ExpenseTypeColors.MANDATORY,
                    },
                  ]}
                />
              )}
              {/* In Progress (Neutral - Gold) */}
              {stats.in_progress > 0 && (
                <View
                  style={[
                    styles.stackedBarSegment,
                    {
                      width: `${(stats.in_progress / stats.total_books) * 100}%`,
                      backgroundColor: ExpenseTypeColors.NEUTRAL,
                    },
                  ]}
                />
              )}
              {/* Not Started (Excess - Red) */}
              {stats.not_started > 0 && (
                <View
                  style={[
                    styles.stackedBarSegment,
                    {
                      width: `${(stats.not_started / stats.total_books) * 100}%`,
                      backgroundColor: ExpenseTypeColors.EXCESS,
                    },
                  ]}
                />
              )}
            </View>
          </View>

          {/* Legend with Expense Type Colors */}
          <View style={styles.breakdownLegend}>
            <View style={styles.breakdownLegendItem}>
              <View style={[styles.legendDot, { backgroundColor: ExpenseTypeColors.MANDATORY }]} />
              <Text style={styles.breakdownLabel}>Completed</Text>
              <Text style={styles.breakdownAmount}>{stats.completed}/{stats.total_books}</Text>
            </View>
            <View style={styles.breakdownLegendItem}>
              <View style={[styles.legendDot, { backgroundColor: ExpenseTypeColors.NEUTRAL }]} />
              <Text style={styles.breakdownLabel}>In Progress</Text>
              <Text style={styles.breakdownAmount}>{stats.in_progress}/{stats.total_books}</Text>
            </View>
            <View style={styles.breakdownLegendItem}>
              <View style={[styles.legendDot, { backgroundColor: ExpenseTypeColors.EXCESS }]} />
              <Text style={styles.breakdownLabel}>Not Started</Text>
              <Text style={styles.breakdownAmount}>{stats.not_started}/{stats.total_books}</Text>
            </View>
          </View>
        </View>

        {/* BOOKS SECTION */}
        <View style={styles.booksSection}>
          <Text style={styles.sectionTitle}>
            {t('bookLibrary')} ({filteredBooks.length})
          </Text>
          {filteredBooks.length > 0 ? (
            filteredBooks.map(renderBook)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color="#999" />
              <Text style={styles.emptyText}>
                {statusFilter === 'all' ? 'No books available yet' : `No ${statusFilter === 'not_started' ? 'unread' : statusFilter === 'in_progress' ? 'in-progress' : 'completed'} books`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ADD BOOK MODAL */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Book</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'search' && styles.tabActive
              ]}
              onPress={() => setActiveTab('search')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'search' && styles.tabTextActive
              ]}>Search Library</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'manual' && styles.tabActive
              ]}
              onPress={() => setActiveTab('manual')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'manual' && styles.tabTextActive
              ]}>Manual Entry</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            {activeTab === 'search' ? (
              <View>
                {/* Search Input */}
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={20} color="#999" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by title or author..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                    editable={!searching}
                  />
                  {searchQuery ? (
                    <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                      <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={[styles.searchBtn, searching && { opacity: 0.6 }]}
                  onPress={handleSearchBooks}
                  disabled={searching || !searchQuery.trim()}
                >
                  {searching ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="search" size={16} color="#fff" />
                      <Text style={styles.searchBtnText}>Search Books</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Search Results */}
                {searching ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000" />
                    <Text style={styles.loadingText}>Searching...</Text>
                  </View>
                ) : searchResults.length > 0 ? (
                  <View style={styles.resultsContainer}>
                    {!selectedBook ? (
                      searchResults.map((book, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.resultItem}
                          onPress={() => setSelectedBook(book)}
                        >
                          <View style={styles.resultContent}>
                            <Text style={styles.resultTitle} numberOfLines={2}>{book.title}</Text>
                            {book.author_name && (
                              <Text style={styles.resultAuthor} numberOfLines={1}>
                                {book.author_name.join(', ')}
                              </Text>
                            )}
                            {book.number_of_pages && (
                              <Text style={styles.resultPages}>
                                {book.number_of_pages} pages
                              </Text>
                            )}
                          </View>
                          <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View>
                        <TouchableOpacity
                          style={styles.backButton}
                          onPress={() => setSelectedBook(null)}
                        >
                          <Ionicons name="chevron-back" size={24} color="#000" />
                          <Text style={styles.backButtonText}>Back to results</Text>
                        </TouchableOpacity>

                        <View style={styles.selectedBookContainer}>
                          <Text style={styles.selectedBookTitle}>{selectedBook.title}</Text>
                          {selectedBook.author_name && (
                            <Text style={styles.selectedBookAuthor}>
                              By {selectedBook.author_name.join(', ')}
                            </Text>
                          )}
                          {selectedBook.number_of_pages && (
                            <Text style={styles.selectedBookPages}>
                              📖 {selectedBook.number_of_pages} pages
                            </Text>
                          )}
                          {selectedBook.first_publish_year && (
                            <Text style={styles.selectedBookYear}>
                              📅 First published {selectedBook.first_publish_year}
                            </Text>
                          )}

                          <TouchableOpacity
                            style={[styles.addBtn, creatingBook && { opacity: 0.6 }]}
                            onPress={addBookFromSearch}
                            disabled={creatingBook}
                          >
                            {creatingBook ? (
                              <ActivityIndicator color="#fff" />
                            ) : (
                              <>
                                <Ionicons name="add-circle" size={18} color="#fff" />
                                <Text style={styles.addBtnText}>Add to Library</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                ) : searchQuery && !searching ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search" size={48} color="#ddd" />
                    <Text style={styles.emptyText}>No books found</Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <View>
                {/* Manual Entry Form */}
                <Text style={styles.formLabel}>Book Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter book title"
                  value={manualTitle}
                  onChangeText={setManualTitle}
                  placeholderTextColor="#ccc"
                />

                <Text style={styles.formLabel}>Author</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter author name"
                  value={manualAuthor}
                  onChangeText={setManualAuthor}
                  placeholderTextColor="#ccc"
                />

                <Text style={styles.formLabel}>Total Pages</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter number of pages"
                  value={manualPages}
                  onChangeText={setManualPages}
                  placeholderTextColor="#ccc"
                  keyboardType="numeric"
                />

                <Text style={styles.formLabel}>Chapters</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter number of chapters"
                  value={manualChapters}
                  onChangeText={setManualChapters}
                  placeholderTextColor="#ccc"
                  keyboardType="numeric"
                />

                <TouchableOpacity
                  style={[styles.addBtn, styles.fullWidth, creatingBook && { opacity: 0.6 }]}
                  onPress={addManualBook}
                  disabled={creatingBook}
                >
                  {creatingBook ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="add-circle" size={18} color="#fff" />
                      <Text style={styles.addBtnText}>Add Book</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BackgroundColors.PRIMARY,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#000',
    fontSize: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  header: {
    flex: 1,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  addBookBtn: {
    padding: 8,
    marginLeft: 12,
  },
  
  // Filter Styles
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  filterBtn: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterBtnTextActive: {
    color: '#fff',
  },
  title: {
    marginBottom: 8,
    color: '#000',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    marginBottom: 4,
    color: '#000',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    width: (width - 48) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metricTitle: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },

  // Achievements
  achievementsSection: {
    marginBottom: 24,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  achievementBadge: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: (width - 48) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementLabel: {
    marginTop: 8,
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Recent Activity
  recentActivityCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  recentActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  recentActivityContent: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  recentBookTitle: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  recentActivityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recentActivityStatus: {
    color: '#666',
    fontSize: 12,
  },

  // Breakdown Section
  breakdownSection: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  stackedBarContainer: {
    marginVertical: 16,
  },
  stackedBar: {
    flexDirection: 'row',
    height: 32,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  stackedBarSegment: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownLegend: {
    gap: 12,
    marginTop: 16,
  },
  breakdownLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  breakdownLabel: {
    flex: 1,
    color: TextColors.SECONDARY,
    fontSize: 13,
    fontWeight: '500',
  },
  breakdownAmount: {
    color: TextColors.PRIMARY,
    fontSize: 13,
    fontWeight: '600',
  },

  booksSection: {
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  bookCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookTitle: {
    marginBottom: 4,
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  bookAuthor: {
    color: '#666',
    fontSize: 13,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#000',
  },
  progressText: {
    minWidth: 40,
    textAlign: 'right',
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  bookSummary: {
    color: '#666',
    lineHeight: 20,
    fontSize: 14,
  },
  bookActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  readPdfBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  readPdfBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  logSessionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  logSessionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    color: '#999',
    fontSize: 14,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: BackgroundColors.PRIMARY,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  tabActive: {
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#000',
  },

  // Modal Content
  modalContent: {
    flex: 1,
    padding: 16,
  },

  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  searchBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Results
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  resultsContainer: {
    marginTop: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  resultAuthor: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  resultPages: {
    fontSize: 11,
    color: '#999',
  },

  // Selected Book
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    gap: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  selectedBookContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  selectedBookTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  selectedBookAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  selectedBookPages: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  selectedBookYear: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },

  // Empty Container
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },

  // Form Styles
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    marginBottom: 12,
  },

  // Add Button
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  fullWidth: {
    marginTop: 24,
    marginBottom: 20,
  },
});
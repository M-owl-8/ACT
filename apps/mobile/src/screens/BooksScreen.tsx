import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView, ThemedText, ThemedCard } from '../components/themed';
import { useTheme } from '../theme';
import { booksApi } from '../api/books';

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

export default function BooksScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total_books: 0,
    not_started: 0,
    in_progress: 0,
    completed: 0,
    completion_rate: 0,
  });

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

  const handleRefresh = () => {
    setRefreshing(true);
    loadBooks();
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'done':
        return theme.colors.success;
      case 'in_progress':
        return theme.colors.accent;
      case 'not_started':
      default:
        return theme.colors.textSecondary;
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

  const renderBook = (book: Book) => {
    const status = book.user_progress?.status || 'not_started';
    const progress = book.user_progress?.progress_percent || 0;

    return (
      <TouchableOpacity
        key={book.id}
        onPress={() => navigation.navigate('BookDetail' as never, { bookId: book.id } as never)}
      >
        <ThemedCard style={styles.bookCard}>
          <View style={styles.bookHeader}>
            <View style={styles.bookInfo}>
              <ThemedText variant="h3" style={styles.bookTitle}>
                {book.title}
              </ThemedText>
              {book.author && (
                <ThemedText variant="caption" style={styles.bookAuthor}>
                  {book.author}
                </ThemedText>
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
                      backgroundColor: getStatusColor(status),
                    },
                  ]}
                />
              </View>
              <ThemedText variant="caption" style={styles.progressText}>
                {progress}%
              </ThemedText>
            </View>
          )}

          {book.summary && (
            <ThemedText
              variant="body"
              style={styles.bookSummary}
              numberOfLines={2}
            >
              {book.summary}
            </ThemedText>
          )}
        </ThemedCard>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <ThemedText variant="body">{t('loading')}</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <ThemedText variant="h1" style={styles.title}>
            {t('financialLiteracy')}
          </ThemedText>
          <ThemedText variant="body" style={styles.subtitle}>
            {t('booksSubtitle')}
          </ThemedText>
        </View>

        <ThemedCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText variant="h2" style={styles.statValue}>
                {stats.completed}
              </ThemedText>
              <ThemedText variant="caption" style={styles.statLabel}>
                {t('completed')}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h2" style={styles.statValue}>
                {stats.in_progress}
              </ThemedText>
              <ThemedText variant="caption" style={styles.statLabel}>
                {t('inProgress')}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h2" style={styles.statValue}>
                {stats.completion_rate}%
              </ThemedText>
              <ThemedText variant="caption" style={styles.statLabel}>
                {t('completionRate')}
              </ThemedText>
            </View>
          </View>
        </ThemedCard>

        <View style={styles.booksSection}>
          <ThemedText variant="h2" style={styles.sectionTitle}>
            {t('bookLibrary')}
          </ThemedText>
          {books.map(renderBook)}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  statsCard: {
    marginBottom: 24,
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
  },
  statLabel: {
    opacity: 0.7,
  },
  booksSection: {
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  bookCard: {
    marginBottom: 12,
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
  },
  bookAuthor: {
    opacity: 0.7,
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
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    minWidth: 40,
    textAlign: 'right',
  },
  bookSummary: {
    opacity: 0.7,
    lineHeight: 20,
  },
});
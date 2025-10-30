import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LIBRARY_BOOKS, RECOMMENDED_BOOKS } from '../constants/booksData';
import { BackgroundColors, TextColors } from '../constants/colors';

const { width } = Dimensions.get('window');

interface LibraryBook {
  id: string;
  title: string;
  author: string;
  titleKey: string;
  isLibrary: boolean;
  pdfFile: string;
}

interface RecommendedBook {
  id: string;
  title: string;
  author: string;
  titleKey: string;
  isLibrary: boolean;
}

export default function BooksScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  // Render library book card with PDF reader action
  const renderLibraryBook = (book: LibraryBook, index: number) => {
    const handleBookPress = () => {
      const translatedTitle = t(book.titleKey);
      console.log('Opening book:', { id: book.id, pdfFile: book.pdfFile, title: translatedTitle });
      navigation.navigate(
        'PDFReader' as never,
        { pdfFile: book.pdfFile, bookTitle: translatedTitle } as never
      );
    };

    return (
      <TouchableOpacity
        key={book.id}
        style={styles.libraryBookCard}
        onPress={handleBookPress}
      >
        <View style={styles.bookCover}>
          <Ionicons name="book" size={50} color="#fff" />
        </View>
        <View style={styles.bookDetails}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {t(book.titleKey)}
          </Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            {book.author}
          </Text>
          <View style={styles.readButton}>
            <Ionicons name="document" size={14} color="#fff" />
            <Text style={styles.readButtonText}>{t('read') || 'Read'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render recommended book card
  const renderRecommendedBook = (book: RecommendedBook, index: number) => {
    return (
      <View key={book.id} style={styles.recommendedBookCard}>
        <View style={styles.recommendedBookCover}>
          <Ionicons name="book-outline" size={40} color="#666" />
        </View>
        <View style={styles.recommendedBookDetails}>
          <Text style={styles.recommendedBookTitle} numberOfLines={2}>
            {t(book.titleKey)}
          </Text>
          <Text style={styles.recommendedBookAuthor} numberOfLines={1}>
            {book.author}
          </Text>
          <Text style={styles.recommendedBookNote}>
            {t('comingSoon') || 'Coming Soon'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📚 {t('financialLiteracy') || 'Financial Literacy'}</Text>
          <Text style={styles.headerSubtitle}>
            {t('booksSubtitle') || 'Learn and grow your financial knowledge'}
          </Text>
        </View>

        {/* Library Books Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 {t('libraryBooks') || 'Library'}</Text>
          <Text style={styles.sectionDescription}>
            {t('libraryBooksDescription') || 'Your personal library of financial books'}
          </Text>
          <View style={styles.libraryBooksContainer}>
            {LIBRARY_BOOKS?.map?.((book, idx) => renderLibraryBook(book as LibraryBook, idx))}
          </View>
        </View>

        {/* Recommended Books Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ {t('recommendedBooks') || 'Recommended'}</Text>
          <Text style={styles.sectionDescription}>
            {t('recommendedBooksDescription') || 'Books we recommend for your financial growth'}
          </Text>
          <View style={styles.recommendedBooksContainer}>
            {RECOMMENDED_BOOKS?.map?.((book, idx) => renderRecommendedBook(book as RecommendedBook, idx))}
          </View>
        </View>

        {/* Footer spacing */}
        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BackgroundColors.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TextColors.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: TextColors.secondary,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: TextColors.primary,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: TextColors.secondary,
    marginBottom: 12,
  },
  // Library Books Styles
  libraryBooksContainer: {
    gap: 12,
  },
  libraryBookCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  bookCover: {
    width: 80,
    height: 110,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TextColors.primary,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: TextColors.secondary,
    marginBottom: 8,
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 6,
  },
  readButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  // Recommended Books Styles
  recommendedBooksContainer: {
    gap: 10,
  },
  recommendedBookCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    overflow: 'hidden',
    padding: 12,
    marginBottom: 8,
  },
  recommendedBookCover: {
    width: 60,
    height: 90,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendedBookDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  recommendedBookTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: TextColors.primary,
    marginBottom: 2,
  },
  recommendedBookAuthor: {
    fontSize: 11,
    color: TextColors.secondary,
    marginBottom: 6,
  },
  recommendedBookNote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#999',
  },
  footerSpacer: {
    height: 30,
  },
});
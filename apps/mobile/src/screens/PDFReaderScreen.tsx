import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Text,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PDFView from 'react-native-pdf';
import { booksApi } from '../api/books';

interface PDFReaderRoute {
  bookId: number;
  bookTitle: string;
}

export default function PDFReaderScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { bookId, bookTitle } = route.params as PDFReaderRoute;

  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    downloadPDF();
  }, [bookId]);

  const downloadPDF = async () => {
    try {
      setLoading(true);
      setError(null);
      const uri = await booksApi.downloadPDF(bookId);
      setPdfUri(uri);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to download PDF');
      Alert.alert(
        t('error'),
        t('failedToDownloadBook') || 'Failed to download the book'
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePageChanged = (page: number) => {
    setCurrentPage(page);
  };

  const handleLoadComplete = (numberOfPages: number) => {
    setTotalPages(numberOfPages);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {bookTitle}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !pdfUri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>{bookTitle}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={64} color="#999" />
          <Text style={styles.errorText}>
            {error || 'Failed to load PDF'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={downloadPDF}
          >
            <Text style={styles.retryButtonText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {bookTitle}
        </Text>
        <Text style={styles.pageIndicator}>
          {currentPage}/{totalPages}
        </Text>
      </View>

      <PDFView
        source={{ uri: pdfUri }}
        onLoadComplete={handleLoadComplete}
        onPageChanged={handlePageChanged}
        style={styles.pdf}
        enableRTL={false}
        fitWidth={true}
        spacing={0}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    width: 40,
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginHorizontal: 12,
  },
  pageIndicator: {
    fontSize: 12,
    color: '#666',
    width: 40,
    textAlign: 'right',
  },
  pdf: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#000',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
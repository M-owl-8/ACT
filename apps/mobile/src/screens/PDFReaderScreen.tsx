import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Text,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PDFView from 'react-native-pdf';
import { TextColors } from '../constants/colors';
import * as FileSystem from 'expo-file-system';

interface PDFReaderRoute {
  pdfFile?: string;
  bookTitle?: string;
  bookId?: number;
}

// Map PDF file names to their require statements - these will be resolved at runtime
const pdfMap: { [key: string]: any } = {
  'Book_1.pdf': require('../../assets/books/Book_1.pdf'),
  'Book_2.pdf': require('../../assets/books/Book_2.pdf'),
  'Book_3.pdf': require('../../assets/books/Book_3.pdf'),
};

export default function PDFReaderScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  
  // Safely extract params with error handling
  const params = route.params as PDFReaderRoute | undefined;
  const pdfFile = params?.pdfFile;
  const bookTitle = params?.bookTitle;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Set timeout for loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (totalPages === 0 && !error) {
        console.warn('PDF loading timeout - took longer than 10 seconds');
        setLoadingTimeout(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [totalPages, error]);

  // Get PDF source - first try local file, fallback to API
  const getPDFSource = () => {
    if (!pdfFile) {
      setError('No PDF file specified');
      return null;
    }
    
    if (!pdfMap[pdfFile]) {
      setError(`PDF file not found: ${pdfFile}`);
      return null;
    }
    
    // Local PDF from assets
    return pdfMap[pdfFile];
  };

  const pdfSource = getPDFSource();

  // Log component mount
  useEffect(() => {
    console.log('PDFReaderScreen mounted', { pdfFile, bookTitle, pdfSourceExists: !!pdfSource });
  }, []);

  if (loadingTimeout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={TextColors.primary} />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {bookTitle || 'Book'}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
          <Text style={styles.errorText}>
            {t('error') || 'Error'}
          </Text>
          <Text style={styles.errorMessage}>
            PDF loading is taking too long. This might be a network or device issue.
          </Text>
          <TouchableOpacity
            style={[styles.centerContent, { marginTop: 20 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.readButtonText}>{t('back') || 'Go Back'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!pdfSource || error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={TextColors.primary} />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {bookTitle || 'Book'}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
          <Text style={styles.errorText}>
            {t('error') || 'Error'}
          </Text>
          <Text style={styles.errorMessage}>
            {error || 'PDF file not found. Please make sure the PDF file is included in the app assets.'}
          </Text>
          <Text style={[styles.errorMessage, { marginTop: 16, fontSize: 12, color: '#999' }]}>
            PDF: {pdfFile || 'unknown'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handlePageChanged = (page: number) => {
    console.log('Page changed to:', page);
    setCurrentPage(page);
  };

  const handleLoadComplete = (numberOfPages: number) => {
    console.log('PDF loaded with pages:', numberOfPages);
    setTotalPages(numberOfPages);
  };

  const handleError = (error: any) => {
    console.error('PDF Error:', error);
    
    let errorMessage = 'Failed to load PDF';
    
    // Handle SSL/Certificate errors
    if (error && typeof error === 'string') {
      if (error.includes('IllegalStateException') || error.includes('trust manager')) {
        errorMessage = '⚠️ SSL Certificate Error - This is a known Android issue. Try:\n1. Rebuilding with: npx expo prebuild --clean\n2. Clearing app cache\n3. Reinstalling the app';
      } else if (error.includes('ReactNativeBlobUtil')) {
        errorMessage = '⚠️ PDF Download Error - Check your network connection and ensure the app has permission to access the internet.';
      } else if (error.includes('timeout')) {
        errorMessage = 'PDF loading timeout - The PDF file is taking too long to load.';
      } else {
        errorMessage = `PDF Error: ${error}`;
      }
    } else if (typeof error === 'number') {
      errorMessage = `Failed to load PDF (Error Code: ${error})`;
    }
    
    setError(errorMessage);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={TextColors.primary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {bookTitle || 'Book'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.pdfContainer}>
        <PDFView
          source={pdfSource}
          onLoadComplete={handleLoadComplete}
          onPageChanged={handlePageChanged}
          onError={handleError}
          style={styles.pdf}
          enablePaging={true}
          spacing={10}
          fitPolicy={0}
          renderActivityIndicator={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>{t('loading') || 'Loading...'}</Text>
            </View>
          )}
        />
      </View>

      {/* Page indicator footer */}
      {totalPages > 0 && (
        <View style={styles.footer}>
          <Text style={styles.pageIndicator}>
            Page {currentPage} of {totalPages}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: TextColors.primary,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  pdf: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: TextColors.secondary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  pageIndicator: {
    fontSize: 13,
    color: TextColors.secondary,
    fontWeight: '500',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: TextColors.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
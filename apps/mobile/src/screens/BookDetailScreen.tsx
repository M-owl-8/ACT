import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView, ThemedText, ThemedCard, ThemedButton } from '../components/themed';
import { useTheme } from '../theme';
import { getDatabase, Book } from '../services/database';

interface BookProgress {
  status: 'not_started' | 'in_progress' | 'done';
  progress_percent: number;
}

export default function BookDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const { bookId } = route.params as { bookId: number };
  const [languageChangeKey, setLanguageChangeKey] = React.useState(0);

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState<BookProgress>({
    status: 'not_started',
    progress_percent: 0,
  });

  const PROGRESS_KEY = `book_progress_${bookId}`;

  const loadBook = async () => {
    try {
      const db = getDatabase();
      const data = await db.getFirstAsync<Book>(
        'SELECT * FROM books WHERE id = ?',
        [bookId]
      );
      if (!data) {
        Alert.alert(t('error'), t('failedToLoadBook'));
        navigation.goBack();
        return;
      }
      setBook(data);

      const savedProgress = await AsyncStorage.getItem(PROGRESS_KEY);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error('Failed to load book:', error);
      Alert.alert(t('error'), t('failedToLoadBook'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBook();
  }, [bookId]);

  useFocusEffect(
    React.useCallback(() => {
      loadBook();
    }, [bookId])
  );

  React.useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageChangeKey(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const updateProgress = async (
    status: 'not_started' | 'in_progress' | 'done',
    progressPercent?: number
  ) => {
    setUpdating(true);
    try {
      const newProgress: BookProgress = {
        status,
        progress_percent: progressPercent !== undefined ? progressPercent : progress.progress_percent,
      };
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
      Alert.alert(t('success'), t('progressUpdated'));
    } catch (error) {
      console.error('Failed to update progress:', error);
      Alert.alert(t('error'), t('failedToUpdateProgress'));
    } finally {
      setUpdating(false);
    }
  };

  const handleStartReading = () => {
    updateProgress('in_progress', 0);
  };

  const handleMarkComplete = () => {
    Alert.alert(
      t('markAsComplete'),
      t('markAsCompleteConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('confirm'), onPress: () => updateProgress('done', 100) },
      ]
    );
  };

  const handleUpdateProgress = () => {
    Alert.prompt(
      t('updateProgress'),
      t('enterProgressPercent'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('update'),
          onPress: (value) => {
            const newPercent = parseInt(value || '0', 10);
            if (newPercent >= 0 && newPercent <= 100) {
              const status =
                newPercent === 100 ? 'done' : newPercent > 0 ? 'in_progress' : 'not_started';
              updateProgress(status, newPercent);
            } else {
              Alert.alert(t('error'), t('invalidProgress'));
            }
          },
        },
      ],
      'plain-text',
      progress.progress_percent.toString()
    );
  };

  if (loading || !book) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <ThemedText variant="body">{t('loading')}</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const status = progress.status;
  const progressPercent = progress.progress_percent;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <ThemedText variant="h1" style={styles.title}>
            {book.title}
          </ThemedText>
          {book.author && (
            <ThemedText variant="h3" style={styles.author}>
              {t('by')} {book.author}
            </ThemedText>
          )}
        </View>

        <ThemedCard style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <ThemedText variant="h3">{t('yourProgress')}</ThemedText>
            <ThemedText
              variant="h2"
              style={[styles.progressPercent, { color: theme.colors.accent }]}
            >
              {progressPercent}%
            </ThemedText>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercent}%` as any,
                  backgroundColor: theme.colors.accent,
                },
              ]}
            />
          </View>

          <View style={styles.statusBadge}>
            <ThemedText variant="caption" style={styles.statusText}>
              {t(`bookStatus_${status}`)}
            </ThemedText>
          </View>

          <View style={styles.actionButtons}>
            {status === 'not_started' && (
              <ThemedButton
                title={t('startReading')}
                onPress={handleStartReading}
                loading={updating}
                style={styles.actionButton}
              />
            )}
            {status === 'in_progress' && (
              <>
                <ThemedButton
                  title={t('updateProgress')}
                  onPress={handleUpdateProgress}
                  loading={updating}
                  variant="outline"
                  style={styles.actionButton}
                />
                <ThemedButton
                  title={t('markComplete')}
                  onPress={handleMarkComplete}
                  loading={updating}
                  style={styles.actionButton}
                />
              </>
            )}
            {status === 'done' && (
              <View style={styles.completedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme.colors.success}
                />
                <ThemedText variant="body" style={styles.completedText}>
                  {t('bookCompleted')}
                </ThemedText>
              </View>
            )}
          </View>
        </ThemedCard>

        {book.description && (
          <ThemedCard style={styles.section}>
            <ThemedText variant="h3" style={styles.sectionTitle}>
              {t('summary')}
            </ThemedText>
            <ThemedText variant="body" style={styles.sectionContent}>
              {book.description}
            </ThemedText>
          </ThemedCard>
        )}
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
  backButton: {
    marginBottom: 16,
    padding: 8,
    alignSelf: 'flex-start',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  author: {
    opacity: 0.7,
  },
  progressCard: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressPercent: {
    fontWeight: 'bold',
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    marginBottom: 16,
  },
  statusText: {
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
  },
  completedText: {
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  sectionContent: {
    lineHeight: 24,
    opacity: 0.8,
  },
});

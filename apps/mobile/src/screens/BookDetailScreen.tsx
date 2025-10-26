import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView, ThemedText, ThemedCard, ThemedButton } from '../components/themed';
import { useTheme } from '../theme';
import { booksApi, ReadingSession } from '../api/books';

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
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const loadBook = async () => {
    try {
      const [data, sessionsData] = await Promise.all([
        booksApi.getBook(bookId),
        booksApi.getReadingSessions(bookId).catch(() => []),
      ]);
      setBook(data);
      setSessions(sessionsData || []);
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

  // Listen for language changes and force re-render
  React.useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageChangeKey(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const updateProgress = async (status: 'not_started' | 'in_progress' | 'done', progress?: number) => {
    if (!book) return;

    setUpdating(true);
    try {
      const updateData: any = { status };
      if (progress !== undefined) {
        updateData.progress_percent = progress;
      }

      await booksApi.updateProgress(bookId, updateData);
      await loadBook(); // Reload to get updated data
      
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
    const currentProgress = book?.user_progress?.progress_percent || 0;
    Alert.prompt(
      t('updateProgress'),
      t('enterProgressPercent'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('update'),
          onPress: (value) => {
            const progress = parseInt(value || '0', 10);
            if (progress >= 0 && progress <= 100) {
              const status = progress === 100 ? 'done' : progress > 0 ? 'in_progress' : 'not_started';
              updateProgress(status, progress);
            } else {
              Alert.alert(t('error'), t('invalidProgress'));
            }
          },
        },
      ],
      'plain-text',
      currentProgress.toString()
    );
  };

  const handleAddReadingSession = () => {
    Alert.prompt(
      'Log Reading Session',
      'How many pages did you read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Next',
          onPress: (pages) => {
            if (pages && parseInt(pages) > 0) {
              Alert.prompt(
                'Time Spent',
                'How many minutes did you spend reading?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Add Session',
                    onPress: async (minutes) => {
                      if (minutes && parseInt(minutes) > 0) {
                        try {
                          setUpdating(true);
                          await booksApi.addReadingSession(bookId, {
                            pages_read: parseInt(pages),
                            time_spent_minutes: parseInt(minutes),
                          });
                          Alert.alert('Success', 'Reading session logged!');
                          loadBook();
                        } catch (error) {
                          Alert.alert(t('error'), 'Failed to log session');
                        } finally {
                          setUpdating(false);
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

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getTotalTimeSpent = () => {
    return sessions.reduce((total, session) => total + session.time_spent_minutes, 0);
  };

  const getTotalPagesRead = () => {
    return sessions.reduce((total, session) => total + session.pages_read, 0);
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

  const status = book.user_progress?.status || 'not_started';
  const progress = book.user_progress?.progress_percent || 0;

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
              {progress}%
            </ThemedText>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
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

        {book.summary && (
          <ThemedCard style={styles.section}>
            <ThemedText variant="h3" style={styles.sectionTitle}>
              {t('summary')}
            </ThemedText>
            <ThemedText variant="body" style={styles.sectionContent}>
              {book.summary}
            </ThemedText>
          </ThemedCard>
        )}

        {book.key_takeaways && (
          <ThemedCard style={styles.section}>
            <ThemedText variant="h3" style={styles.sectionTitle}>
              {t('keyTakeaways')}
            </ThemedText>
            {JSON.parse(book.key_takeaways).map((takeaway: string, index: number) => (
              <View key={index} style={styles.takeawayItem}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={theme.colors.accent}
                />
                <ThemedText variant="body" style={styles.takeawayText}>
                  {takeaway}
                </ThemedText>
              </View>
            ))}
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
  takeawayItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  takeawayText: {
    flex: 1,
    lineHeight: 22,
  },
});
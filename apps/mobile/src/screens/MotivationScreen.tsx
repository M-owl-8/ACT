import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/client';
import { useTranslation } from 'react-i18next';
import { SAMURAI_COLORS, SAMURAI_PATTERNS } from '../theme/SAMURAI_COLORS';

const { width } = Dimensions.get('window');

interface Streak {
  current_count: number;
  best_count: number;
  last_check_date: string;
}

interface Goal {
  id: number;
  kind: string;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  status: string;
  start_date: string;
  end_date: string;
  progress_percentage: number | null;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'no_spend_day' | 'three_day_no_spend';
  days_required: number;
  current_days: number;
  is_active: boolean;
  completed: boolean;
}

export default function MotivationScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  
  // Goal form state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalType, setGoalType] = useState<'spend_under' | 'log_n_days'>('spend_under');
  const [targetValue, setTargetValue] = useState('');
  const [goalDays, setGoalDays] = useState('7'); // Default to 7 days

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStreak(),
        loadGoals(),
        loadChallenges(),
      ]);
    } catch (error) {
      console.error('Error loading motivation data:', error);
      Alert.alert('Error', 'Failed to load motivation data');
    } finally {
      setLoading(false);
    }
  };

  const loadStreak = async () => {
    try {
      const response = await api.get('/motivation/streak');
      setStreak(response.data);
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const loadGoals = async () => {
    try {
      const response = await api.get('/motivation/goals');
      console.log('Goals loaded:', response.data);
      
      if (Array.isArray(response.data)) {
        setGoals(response.data);
      } else {
        console.warn('Goals response is not an array:', response.data);
        setGoals([]);
      }
    } catch (error: any) {
      console.error('Error loading goals:', error);
      console.error('Error response:', error.response?.data);
      // Set empty array on error to prevent UI issues
      setGoals([]);
    }
  };

  const loadChallenges = async () => {
    // Mock challenges for now - can be extended with backend support
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        title: 'No-Spend Day',
        description: 'Complete one day without any expenses',
        type: 'no_spend_day',
        days_required: 1,
        current_days: 0,
        is_active: true,
        completed: false,
      },
      {
        id: '2',
        title: '3-Day No-Spend Challenge',
        description: 'Complete three consecutive days without expenses',
        type: 'three_day_no_spend',
        days_required: 3,
        current_days: 0,
        is_active: false,
        completed: false,
      },
    ];
    setChallenges(mockChallenges);
  };

  const handleCreateGoal = async () => {
    if (!goalTitle.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    if (!targetValue || parseFloat(targetValue) <= 0) {
      Alert.alert('Error', 'Please enter a valid target value');
      return;
    }

    if (!goalDays || parseInt(goalDays) <= 0) {
      Alert.alert('Error', 'Please enter a valid number of days');
      return;
    }

    try {
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(goalDays));

      const goalData = {
        kind: goalType,
        title: goalTitle.trim(),
        description: goalDescription.trim() || null,
        target_value: parseFloat(targetValue),
        status: 'active',
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
      };

      console.log('Creating goal with data:', goalData);
      const response = await api.post('/motivation/goals', goalData);
      console.log('Goal created successfully:', response.data);

      // Reset form
      setGoalTitle('');
      setGoalDescription('');
      setTargetValue('');
      setGoalDays('7');
      setShowAddGoalModal(false);

      // Reload goals
      await loadGoals();
      Alert.alert('Success', 'Goal created successfully!');
    } catch (error: any) {
      console.error('Error creating goal:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to create goal. ';
      
      if (error.response) {
        // Server responded with error
        errorMessage += error.response.data?.detail || 
                       error.response.data?.message || 
                       `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response
        errorMessage += 'No response from server. Please check your internet connection.';
      } else {
        // Error in request setup
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      Alert.alert(
        'Error Creating Goal',
        errorMessage,
        [
          {
            text: 'Retry',
            onPress: () => handleCreateGoal(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/motivation/goals/${goalId}`);
              await loadGoals();
              Alert.alert('Success', 'Goal deleted');
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert('Error', 'Failed to delete goal');
            }
          },
        },
      ]
    );
  };

  const handleStartChallenge = (challengeId: string) => {
    Alert.alert(
      'Start Challenge',
      'Are you ready to start this challenge?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            setChallenges(prev =>
              prev.map(c =>
                c.id === challengeId ? { ...c, is_active: true } : c
              )
            );
            Alert.alert('Challenge Started!', 'Good luck! 🎯');
          },
        },
      ]
    );
  };

  const getStreakColor = (count: number) => {
    if (count === 0) return '#9E9E9E';
    if (count < 7) return '#FF9800';
    if (count < 30) return '#FF5722';
    return '#F44336';
  };

  const getStreakEmoji = (count: number) => {
    if (count === 0) return '💤';
    if (count < 7) return '🔥';
    if (count < 30) return '🔥🔥';
    return '🔥🔥🔥';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SAMURAI_COLORS.accent.red} />
          <Text style={styles.loadingText}>Loading motivation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Motivation</Text>
          <Text style={styles.headerSubtitle}>Stay consistent, achieve your goals</Text>
        </View>

        {/* Streak Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Streak</Text>
          <View style={styles.streakCard}>
            <View style={styles.streakMain}>
              <Text style={[styles.streakEmoji, { color: getStreakColor(streak?.current_count || 0) }]}>
                {getStreakEmoji(streak?.current_count || 0)}
              </Text>
              <View style={styles.streakInfo}>
                <Text style={styles.streakCount}>{streak?.current_count || 0}</Text>
                <Text style={styles.streakLabel}>Day Streak</Text>
              </View>
            </View>
            <View style={styles.streakBest}>
              <Text style={styles.streakBestLabel}>Best Streak</Text>
              <Text style={styles.streakBestCount}>{streak?.best_count || 0} days</Text>
            </View>
            <Text style={styles.streakDescription}>
              Log at least one entry each day to maintain your streak!
            </Text>
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Goals</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddGoalModal(true)}
            >
              <Ionicons name="add-circle" size={28} color={SAMURAI_COLORS.accent.red} />
            </TouchableOpacity>
          </View>

          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="flag-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyStateText}>No goals yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Create a goal to track your progress
              </Text>
            </View>
          ) : (
            goals.map(goal => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalTitleContainer}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    {goal.description && (
                      <Text style={styles.goalDescription}>{goal.description}</Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteGoal(goal.id)}>
                    <Ionicons name="trash-outline" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(goal.progress_percentage || 0, 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {goal.progress_percentage?.toFixed(0) || 0}%
                  </Text>
                </View>

                {/* Goal Stats */}
                <View style={styles.goalStats}>
                  <View style={styles.goalStat}>
                    <Text style={styles.goalStatLabel}>Current</Text>
                    <Text style={styles.goalStatValue}>
                      {goal.kind === 'spend_under' ? '$' : ''}
                      {goal.current_value}
                      {goal.kind === 'log_n_days' ? ' days' : ''}
                    </Text>
                  </View>
                  <View style={styles.goalStat}>
                    <Text style={styles.goalStatLabel}>Target</Text>
                    <Text style={styles.goalStatValue}>
                      {goal.kind === 'spend_under' ? '$' : ''}
                      {goal.target_value}
                      {goal.kind === 'log_n_days' ? ' days' : ''}
                    </Text>
                  </View>
                  <View style={styles.goalStat}>
                    <Text style={styles.goalStatLabel}>Status</Text>
                    <Text
                      style={[
                        styles.goalStatValue,
                        { color: goal.status === 'active' ? '#4CAF50' : '#9E9E9E' },
                      ]}
                    >
                      {goal.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Challenges Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenges</Text>
          {challenges.map(challenge => (
            <View key={challenge.id} style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <View style={styles.challengeIcon}>
                  <Ionicons
                    name={challenge.completed ? 'checkmark-circle' : 'trophy-outline'}
                    size={32}
                    color={challenge.completed ? '#4CAF50' : '#FF9800'}
                  />
                </View>
                <View style={styles.challengeInfo}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                </View>
              </View>

              {/* Challenge Progress */}
              <View style={styles.challengeProgress}>
                <View style={styles.challengeDays}>
                  {Array.from({ length: challenge.days_required }).map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.challengeDay,
                        index < challenge.current_days && styles.challengeDayComplete,
                      ]}
                    >
                      <Text
                        style={[
                          styles.challengeDayText,
                          index < challenge.current_days && styles.challengeDayTextComplete,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Challenge Action */}
              {!challenge.completed && (
                <TouchableOpacity
                  style={[
                    styles.challengeButton,
                    challenge.is_active && styles.challengeButtonActive,
                  ]}
                  onPress={() => !challenge.is_active && handleStartChallenge(challenge.id)}
                  disabled={challenge.is_active}
                >
                  <Text
                    style={[
                      styles.challengeButtonText,
                      challenge.is_active && styles.challengeButtonTextActive,
                    ]}
                  >
                    {challenge.is_active ? 'In Progress...' : 'Start Challenge'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Weekly Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Entries Logged</Text>
              <Text style={styles.summaryValue}>-</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Days Active</Text>
              <Text style={styles.summaryValue}>-</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Goals Progress</Text>
              <Text style={styles.summaryValue}>
                {goals.filter(g => g.status === 'active').length} active
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddGoalModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Goal</Text>
              <TouchableOpacity onPress={() => setShowAddGoalModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Goal Type */}
              <Text style={styles.inputLabel}>Goal Type</Text>
              <View style={styles.goalTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.goalTypeButton,
                    goalType === 'spend_under' && styles.goalTypeButtonActive,
                  ]}
                  onPress={() => setGoalType('spend_under')}
                >
                  <Text
                    style={[
                      styles.goalTypeButtonText,
                      goalType === 'spend_under' && styles.goalTypeButtonTextActive,
                    ]}
                  >
                    Spend Under
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.goalTypeButton,
                    goalType === 'log_n_days' && styles.goalTypeButtonActive,
                  ]}
                  onPress={() => setGoalType('log_n_days')}
                >
                  <Text
                    style={[
                      styles.goalTypeButtonText,
                      goalType === 'log_n_days' && styles.goalTypeButtonTextActive,
                    ]}
                  >
                    Log N Days
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Title */}
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                value={goalTitle}
                onChangeText={setGoalTitle}
                placeholder="e.g., Spend less than $500 this week"
                placeholderTextColor="#999"
              />

              {/* Description */}
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={goalDescription}
                onChangeText={setGoalDescription}
                placeholder="Optional description"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />

              {/* Target Value */}
              <Text style={styles.inputLabel}>
                Target {goalType === 'spend_under' ? 'Amount' : 'Days'} *
              </Text>
              <TextInput
                style={styles.input}
                value={targetValue}
                onChangeText={setTargetValue}
                placeholder={goalType === 'spend_under' ? '500' : '7'}
                placeholderTextColor="#999"
                keyboardType="numeric"
              />

              {/* Duration */}
              <Text style={styles.inputLabel}>Duration (days) *</Text>
              <TextInput
                style={styles.input}
                value={goalDays}
                onChangeText={setGoalDays}
                placeholder="7"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowAddGoalModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleCreateGoal}
              >
                <Text style={styles.modalButtonPrimaryText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SAMURAI_COLORS.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: SAMURAI_COLORS.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderBottomWidth: 2,
    borderBottomColor: SAMURAI_COLORS.accent.red,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SAMURAI_COLORS.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.secondary,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
    marginBottom: 12,
  },
  addButton: {
    padding: 4,
  },

  // Streak Styles
  streakCard: {
    ...SAMURAI_PATTERNS.cardWithAccent,
    padding: 20,
    ...SAMURAI_PATTERNS.shadowMedium,
  },
  streakMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakEmoji: {
    fontSize: 64,
    marginRight: 20,
  },
  streakInfo: {
    flex: 1,
  },
  streakCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: SAMURAI_COLORS.accent.red,
  },
  streakLabel: {
    fontSize: 16,
    color: SAMURAI_COLORS.text.secondary,
  },
  streakBest: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: SAMURAI_COLORS.border.primary,
    marginBottom: 12,
  },
  streakBestLabel: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.secondary,
  },
  streakBestCount: {
    fontSize: 18,
    fontWeight: '600',
    color: SAMURAI_COLORS.semantic.neutral,
  },
  streakDescription: {
    fontSize: 12,
    color: SAMURAI_COLORS.text.tertiary,
    fontStyle: 'italic',
  },

  // Goal Styles
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.secondary,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.tertiary,
    marginTop: 4,
  },
  goalCard: {
    ...SAMURAI_PATTERNS.cardWithAccent,
    padding: 16,
    marginBottom: 12,
    ...SAMURAI_PATTERNS.shadowSmall,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.secondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: SAMURAI_COLORS.border.primary,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: SAMURAI_COLORS.semantic.income,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: SAMURAI_COLORS.semantic.income,
    minWidth: 45,
    textAlign: 'right',
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: SAMURAI_COLORS.border.primary,
  },
  goalStat: {
    alignItems: 'center',
  },
  goalStatLabel: {
    fontSize: 12,
    color: SAMURAI_COLORS.text.tertiary,
    marginBottom: 4,
  },
  goalStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
  },

  // Challenge Styles
  challengeCard: {
    ...SAMURAI_PATTERNS.cardWithAccent,
    padding: 16,
    marginBottom: 12,
    ...SAMURAI_PATTERNS.shadowSmall,
  },
  challengeHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  challengeIcon: {
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.secondary,
  },
  challengeProgress: {
    marginBottom: 16,
  },
  challengeDays: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  challengeDay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SAMURAI_COLORS.border.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  challengeDayComplete: {
    backgroundColor: SAMURAI_COLORS.semantic.income,
  },
  challengeDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.tertiary,
  },
  challengeDayTextComplete: {
    color: SAMURAI_COLORS.text.primary,
  },
  challengeButton: {
    backgroundColor: SAMURAI_COLORS.accent.red,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  challengeButtonActive: {
    backgroundColor: SAMURAI_COLORS.border.primary,
  },
  challengeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
  },
  challengeButtonTextActive: {
    color: SAMURAI_COLORS.text.tertiary,
  },

  // Summary Styles
  summaryCard: {
    ...SAMURAI_PATTERNS.cardWithAccent,
    padding: 16,
    ...SAMURAI_PATTERNS.shadowSmall,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: SAMURAI_COLORS.border.primary,
  },
  summaryLabel: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.secondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: SAMURAI_COLORS.opacity.subtle,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: SAMURAI_COLORS.accent.red,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SAMURAI_COLORS.text.primary,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    ...SAMURAI_PATTERNS.inputField,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  goalTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  goalTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: SAMURAI_COLORS.border.primary,
    alignItems: 'center',
  },
  goalTypeButtonActive: {
    borderColor: SAMURAI_COLORS.accent.red,
    backgroundColor: SAMURAI_COLORS.opacity.redSubtle,
  },
  goalTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.secondary,
  },
  goalTypeButtonTextActive: {
    color: SAMURAI_COLORS.accent.red,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: SAMURAI_COLORS.border.primary,
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SAMURAI_COLORS.border.primary,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.secondary,
  },
  modalButtonPrimary: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: SAMURAI_COLORS.accent.red,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
  },
});
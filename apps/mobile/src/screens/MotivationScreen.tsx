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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useGoalsStore, Goal } from '../store/goals';
import { addSyncListener } from '../services/syncService';

const { width } = Dimensions.get('window');

interface Challenge {
  consecutive_no_spend_days: number;
  last_no_spend_date: string | null;
  days_with_discretionary_spending: number;
  personal_record: number;
}

export default function MotivationScreen() {
  const { t, i18n } = useTranslation();
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [languageChangeKey, setLanguageChangeKey] = useState(0);
  
  // Goal form state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalType, setGoalType] = useState<'spend_under' | 'log_n_days' | 'savings'>('spend_under');
  const [targetValue, setTargetValue] = useState('');
  const [goalDays, setGoalDays] = useState('7'); // Default to 7 days

  // Use the auto-save goals store
  const { goals, loading, loadGoals, syncGoalsToBackend } = useGoalsStore();

  useEffect(() => {
    // Load goals on mount
    loadGoals();

    // Register for sync events when network comes back online
    const unsubscribe = addSyncListener('goals', syncGoalsToBackend);
    
    return () => {
      unsubscribe?.();
    };
  }, [loadGoals, syncGoalsToBackend]);
  
  // Listen for language changes to force re-render
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      console.log(`🌐 MotivationScreen detected language change to: ${lng}`);
      setLanguageChangeKey(prev => prev + 1);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const handleCreateGoal = async () => {
    if (!goalTitle.trim()) {
      Alert.alert(t('error'), t('invalidGoalTitle'));
      return;
    }

    if (!targetValue || parseFloat(targetValue) <= 0) {
      Alert.alert(t('error'), t('invalidTargetValue'));
      return;
    }

    if (!goalDays || parseInt(goalDays) <= 0) {
      Alert.alert(t('error'), t('invalidNumberOfDays'));
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
      
      // Use the store to create goal - automatically saves and syncs
      await useGoalsStore.getState().createGoal(goalData);

      // Reset form
      setGoalTitle('');
      setGoalDescription('');
      setTargetValue('');
      setGoalDays('7');
      setShowAddGoalModal(false);

      Alert.alert(t('success'), t('goalCreatedSuccessfully'));
    } catch (error: any) {
      console.error('Error creating goal:', error);
      
      let errorMessage = t('failedToCreateGoal') + ' ';
      let errorTitle = t('errorCreatingGoalTitle');
      
      // Check for session expiration
      if (error.message?.includes('No refresh token available') || 
          error.message?.includes('session expired')) {
        errorTitle = t('sessionExpired');
        errorMessage = t('sessionExpiredMessage');
      } else if (error.response?.data?.detail) {
        errorMessage += error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.status) {
        errorMessage += `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage += 'No response from server. Please check your internet connection.';
      } else {
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      Alert.alert(errorTitle, errorMessage);
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    Alert.alert(
      t('deleteGoalTitle'),
      t('deleteGoalConfirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('deleteButtonText'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Use the store to delete goal - automatically saves and syncs
              await useGoalsStore.getState().deleteGoal(goalId);
              Alert.alert(t('success'), t('goalDeleted'));
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert(t('error'), t('failedToDeleteGoal'));
            }
          },
        },
      ]
    );
  };

  const handleCompleteGoal = async (goalId: number, title: string) => {
    Alert.alert(
      t('completeGoalTitle'),
      t('markAsCompletedQuestion').replace('{title}', title),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('completeButtonText'),
          style: 'default',
          onPress: async () => {
            try {
              // Use the store to complete goal - automatically saves and syncs
              await useGoalsStore.getState().completeGoal(goalId);
              Alert.alert(t('success'), t('goalCompletedSuccess'));
            } catch (error) {
              console.error('Error completing goal:', error);
              Alert.alert(t('error'), t('failedToCompleteGoal'));
            }
          },
        },
      ]
    );
  };

  const handleAddSavings = async (goalId: number, amount: number) => {
    try {
      // Use the store to add savings - automatically saves and syncs
      const updatedGoal = await useGoalsStore.getState().addSavings(goalId, amount);
      
      // Check if goal was auto-completed
      if (updatedGoal?.status === 'completed') {
        Alert.alert(t('success'), `${t('addSavingsPromptMessage').split(':')[0]}: $${amount}! ${t('goalCompletedSuccess')}`);
      } else {
        const progress = updatedGoal?.progress_percentage || 0;
        Alert.alert(t('success'), `${t('addSavingsPromptMessage').split(':')[0]}: $${amount}! ${t('goalsProgressLabel')}: ${progress.toFixed(0)}%`);
      }
    } catch (error: any) {
      console.error('Error adding savings:', error);
      const errorMsg = error.response?.data?.detail || t('failedToAddIncome');
      Alert.alert(t('error'), errorMsg);
    }
  };





  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>{t('loadingGoals')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} key={languageChangeKey}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('goalsHeaderTitle')}</Text>
          <Text style={styles.headerSubtitle}>{t('goalsHeaderSubtitle')}</Text>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('goalsHeaderTitle')}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddGoalModal(true)}
            >
              <Ionicons name="add-circle" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="flag-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyStateText}>{t('noGoalsText')}</Text>
              <Text style={styles.emptyStateSubtext}>
                {t('noGoalsCreateMessage')}
              </Text>
            </View>
          ) : (
            goals
              .filter(g => g.status === 'active')
              .map(goal => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalTitleContainer}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    {goal.description && (
                      <Text style={styles.goalDescription}>{goal.description}</Text>
                    )}
                  </View>
                  <View style={styles.goalHeaderButtons}>
                    <TouchableOpacity 
                      style={styles.goalHeaderButton}
                      onPress={() => handleCompleteGoal(goal.id, goal.title)}
                    >
                      <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.goalHeaderButton}
                      onPress={() => handleDeleteGoal(goal.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#000" />
                    </TouchableOpacity>
                  </View>
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
                    <Text style={styles.goalStatLabel}>{t('currentStatLabel')}</Text>
                    <Text style={styles.goalStatValue}>
                      {goal.kind === 'spend_under' || goal.kind === 'savings' ? '$' : ''}
                      {goal.current_value}
                      {goal.kind === 'log_n_days' ? ` ${t('daysUnit')}` : ''}
                    </Text>
                  </View>
                  <View style={styles.goalStat}>
                    <Text style={styles.goalStatLabel}>{t('targetStatLabel')}</Text>
                    <Text style={styles.goalStatValue}>
                      {goal.kind === 'spend_under' || goal.kind === 'savings' ? '$' : ''}
                      {goal.target_value}
                      {goal.kind === 'log_n_days' ? ` ${t('daysUnit')}` : ''}
                    </Text>
                  </View>
                  <View style={styles.goalStat}>
                    <Text style={styles.goalStatLabel}>{t('statusStatLabel')}</Text>
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

                {/* Add Savings Button for Savings Goals */}
                {goal.kind === 'savings' && goal.status === 'active' && (
                  <TouchableOpacity
                    style={styles.addSavingsButton}
                    onPress={() => {
                      Alert.prompt(
                        t('addSavingsLabel'),
                        t('addSavingsPrompt'),
                        (amount) => {
                          const parsedAmount = parseFloat(amount);
                          if (!isNaN(parsedAmount) && parsedAmount > 0) {
                            handleAddSavings(goal.id, parsedAmount);
                          } else {
                            Alert.alert(t('invalidAmountTitle'), t('pleaseEnterValidAmountError'));
                          }
                        },
                        'plain-text',
                        '',
                        'decimal-pad'
                      );
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.addSavingsButtonText}>{t('addSavingsLabel')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        {/* Failed Goals Section */}
        {goals.filter(g => g.status === 'failed').length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>❌ {t('failedGoalsHeader') || 'Failed Goals'}</Text>
            <View>
              {goals
                .filter(g => g.status === 'failed')
                .map(goal => (
                  <View key={goal.id} style={[styles.goalCard, { borderLeftColor: '#F44336', borderLeftWidth: 4 }]}>
                    <View style={styles.goalHeader}>
                      <View style={styles.goalTitleContainer}>
                        <Text style={styles.goalTitle}>{goal.title}</Text>
                        {goal.description && (
                          <Text style={styles.goalDescription}>{goal.description}</Text>
                        )}
                      </View>
                      <View style={styles.goalHeaderButtons}>
                        <TouchableOpacity 
                          style={styles.goalHeaderButton}
                          onPress={() => handleDeleteGoal(goal.id)}
                        >
                          <Ionicons name="trash-outline" size={20} color="#F44336" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${Math.min(goal.progress_percentage || 0, 100)}%`, backgroundColor: '#F44336' },
                          ]}
                        />
                      </View>
                      <Text style={[styles.progressText, { color: '#F44336' }]}>
                        {goal.progress_percentage?.toFixed(0) || 0}%
                      </Text>
                    </View>

                    {/* Goal Stats */}
                    <View style={styles.goalStats}>
                      <View style={styles.goalStat}>
                        <Text style={styles.goalStatLabel}>{t('currentStatLabel')}</Text>
                        <Text style={styles.goalStatValue}>
                          {goal.kind === 'spend_under' || goal.kind === 'savings' ? '$' : ''}
                          {goal.current_value}
                          {goal.kind === 'log_n_days' ? ` ${t('daysUnit')}` : ''}
                        </Text>
                      </View>
                      <View style={styles.goalStat}>
                        <Text style={styles.goalStatLabel}>{t('targetStatLabel')}</Text>
                        <Text style={styles.goalStatValue}>
                          {goal.kind === 'spend_under' || goal.kind === 'savings' ? '$' : ''}
                          {goal.target_value}
                          {goal.kind === 'log_n_days' ? ` ${t('daysUnit')}` : ''}
                        </Text>
                      </View>
                      <View style={styles.goalStat}>
                        <Text style={styles.goalStatLabel}>{t('statusStatLabel')}</Text>
                        <Text style={[styles.goalStatValue, { color: '#F44336' }]}>
                          Failed
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Accomplishments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('achievementsHeader')}</Text>
          {goals.filter(g => g.status === 'completed').length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyStateText}>{t('noAccomplishmentsYet')}</Text>
              <Text style={styles.emptyStateSubtext}>
                {t('completeActiveGoalsMessage')}
              </Text>
            </View>
          ) : (
            goals
              .filter(g => g.status === 'completed')
              .map(goal => (
                <View key={goal.id} style={styles.accomplishmentCard}>
                  <View style={styles.accomplishmentHeader}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.accomplishmentIcon} />
                    <View style={styles.accomplishmentTitleContainer}>
                      <Text style={styles.accomplishmentTitle}>{goal.title}</Text>
                      {goal.description && (
                        <Text style={styles.accomplishmentDescription}>{goal.description}</Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.accomplishmentStats}>
                    <View style={styles.accomplishmentStat}>
                      <Text style={styles.accomplishmentStatLabel}>{t('achievedLabel')}</Text>
                      <Text style={styles.accomplishmentStatValue}>
                        {goal.kind === 'spend_under' || goal.kind === 'savings' ? '$' : ''}
                        {goal.current_value}
                        {goal.kind === 'log_n_days' ? ` ${t('daysLabel')}` : ''}
                      </Text>
                    </View>
                    <View style={styles.accomplishmentStat}>
                      <Text style={styles.accomplishmentStatLabel}>{t('targetLabel')}</Text>
                      <Text style={styles.accomplishmentStatValue}>
                        {goal.kind === 'spend_under' || goal.kind === 'savings' ? '$' : ''}
                        {goal.target_value}
                        {goal.kind === 'log_n_days' ? ` ${t('daysLabel')}` : ''}
                      </Text>
                    </View>
                    <View style={styles.accomplishmentStat}>
                      <Text style={styles.accomplishmentStatLabel}>{t('completionLabel')}</Text>
                      <Text style={styles.accomplishmentStatValue}>
                        {goal.progress_percentage?.toFixed(0) || 100}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.accomplishmentDateContainer}>
                    <Text style={styles.accomplishmentDate}>
                      {t('completedLabel')}: {new Date(goal.end_date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
          )}
        </View>



        {/* Weekly Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('thisWeekHeader')}</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('entriesLoggedHeader')}</Text>
              <Text style={styles.summaryValue}>-</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('daysActiveHeader')}</Text>
              <Text style={styles.summaryValue}>-</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('goalsProgressHeader')}</Text>
              <Text style={styles.summaryValue}>
                {goals.filter(g => g.status === 'active').length} {t('activeLabel')}
              </Text>
            </View>
          </View>
        </View>

        {/* Recommended Books Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('recommendedBooks')}</Text>
          <Text style={styles.recommendedBooksDescription}>{t('recommendedBooksDescription')}</Text>
          
          <View style={styles.booksGrid}>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_intelligentInvestor')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_randomWallStreet')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_littleBookCommonSense')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_moneyMasterGame')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_indexCard')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_boggleheadsGuide')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_thinkGrowRich')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_psychologyMoney')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_yourMoneyLife')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_simplePathWealth')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_beatMarket')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_principlesLife')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_fewLessonsInvestors')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_millionaireNextDoor')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_earlyRetirementExtreme')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_smartestMoneyBook')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_fooledRandomness')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_behavioralInvestor')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_richestManInBabylon')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_atomicHabits')}</Text>
            </View>
            <View style={styles.bookItem}>
              <Text style={styles.bookTitle}>{t('book_richDadPoorDad')}</Text>
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('createGoalTitle')}</Text>
                <TouchableOpacity onPress={() => setShowAddGoalModal(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              {/* Goal Type */}
              <Text style={styles.inputLabel}>{t('goalTypeHeader')}</Text>
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
                    {t('spendUnderLabel')}
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
                    {t('logNDaysLabel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.goalTypeButton,
                    goalType === 'savings' && styles.goalTypeButtonActive,
                  ]}
                  onPress={() => setGoalType('savings')}
                >
                  <Text
                    style={[
                      styles.goalTypeButtonText,
                      goalType === 'savings' && styles.goalTypeButtonTextActive,
                    ]}
                  >
                    {t('savingsLabel')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Title */}
              <Text style={styles.inputLabel}>{t('titleFieldLabel')} *</Text>
              <TextInput
                style={styles.input}
                value={goalTitle}
                onChangeText={setGoalTitle}
                placeholder={t('titleFieldPlaceholder')}
                placeholderTextColor="#999"
              />

              {/* Description */}
              <Text style={styles.inputLabel}>{t('descriptionFieldLabel')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={goalDescription}
                onChangeText={setGoalDescription}
                placeholder={t('descriptionFieldPlaceholder')}
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />

              {/* Target Value */}
              <Text style={styles.inputLabel}>
                {t('targetFieldLabel')} {goalType === 'spend_under' ? t('amountFieldLabel') : goalType === 'savings' ? t('savingsAmountFieldLabel') : t('daysLabel')} *
              </Text>
              <TextInput
                style={styles.input}
                value={targetValue}
                onChangeText={setTargetValue}
                placeholder={goalType === 'spend_under' || goalType === 'savings' ? t('amountPlaceholder') : t('durationPlaceholder')}
                placeholderTextColor="#999"
                keyboardType="numeric"
              />

              {/* Duration */}
              <Text style={styles.inputLabel}>{t('durationFieldLabel')} *</Text>
              <TextInput
                style={styles.input}
                value={goalDays}
                onChangeText={setGoalDays}
                placeholder={t('durationPlaceholder')}
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalButtonSecondary}
                  onPress={() => setShowAddGoalModal(false)}
                >
                  <Text style={styles.modalButtonSecondaryText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButtonPrimary}
                  onPress={handleCreateGoal}
                >
                  <Text style={styles.modalButtonPrimaryText}>{t('createGoalTitle')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#333',
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
    color: '#000',
    marginBottom: 12,
  },
  addButton: {
    padding: 4,
  },

  // Goal Styles
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
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
  goalHeaderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  goalHeaderButton: {
    padding: 4,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#333',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    minWidth: 45,
    textAlign: 'right',
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  goalStat: {
    alignItems: 'center',
  },
  goalStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  goalStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },

  // Summary Styles
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#333',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },

  // Books Styles
  recommendedBooksDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bookItem: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
    lineHeight: 18,
  },

  // Modal Styles
  keyboardAvoidingView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
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
    borderColor: '#ddd',
    alignItems: 'center',
  },
  goalTypeButtonActive: {
    borderColor: '#000',
    backgroundColor: '#f0f0f0',
  },
  goalTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  goalTypeButtonTextActive: {
    color: '#000',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalButtonPrimary: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Hide Toggle Styles
  hideToggle: {
    padding: 8,
  },

  // Accomplishment Styles
  accomplishmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  accomplishmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  accomplishmentIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  accomplishmentTitleContainer: {
    flex: 1,
  },
  accomplishmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  accomplishmentDescription: {
    fontSize: 14,
    color: '#333',
  },
  accomplishmentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  accomplishmentStat: {
    alignItems: 'center',
  },
  accomplishmentStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  accomplishmentStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  accomplishmentDateContainer: {
    paddingTop: 8,
  },
  accomplishmentDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  // Add Savings Button Styles
  addSavingsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSavingsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Books Section Styles
  bookFilterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  bookFilterButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  bookFilterButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  bookFilterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  bookFilterButtonTextActive: {
    color: '#fff',
  },

  // Book Card Styles
  bookCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  bookCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  bookCardTitle: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },

  // Book Stats
  bookStats: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  bookStatItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  bookStatLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  bookStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  logSessionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  logSessionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  // Book Date
  bookDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  // Book Tab Styles
  bookTabContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bookTab: {
    flex: 1,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  bookTabInactive: {
    borderBottomColor: 'transparent',
  },
  bookTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textAlign: 'center',
  },
  bookTabTextActive: {
    color: '#000',
  },

  // Search Results Styles
  searchLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  searchLoadingText: {
    fontSize: 14,
    color: '#666',
  },
  searchResultsContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  searchResultAuthor: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  searchResultPages: {
    fontSize: 11,
    color: '#999',
  },
  emptySearchResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptySearchText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
});
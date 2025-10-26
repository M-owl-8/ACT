import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth';
import { API } from '../api/client';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { user, logout, fetchProfile } = useAuthStore();
  const [name, setName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [languageChangeKey, setLanguageChangeKey] = useState(0);

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

  const handleSaveName = async () => {
    if (!name.trim()) return;
    
    setIsSaving(true);
    try {
      await API.patch('/users/me', { name: name.trim() });
      await fetchProfile();
      setIsEditing(false);
      setName('');
    } catch (error) {
      console.error('Failed to update name:', error);
      alert(t('failedToSaveChanges'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView key={languageChangeKey} style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.emoji}>👤</Text>
          <Text style={styles.title}>{t('profile')}</Text>
        </View>
        <LanguageSwitcher />
      </View>

      <View style={styles.header}>
        <Text style={styles.welcomeText}>{t('welcome')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t('email')}</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t('name')}</Text>
        {user?.name ? (
          <View>
            <Text style={styles.value}>{user.name}</Text>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>{t('edit')}</Text>
            </TouchableOpacity>
          </View>
        ) : isEditing ? (
          <View>
            <TextInput
              style={styles.input}
              placeholder={t('fullNameLabel')}
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleSaveName}
                disabled={isSaving || !name.trim()}
              >
                <Text style={styles.buttonText}>
                  {isSaving ? t('loading') : t('save')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => {
                  setIsEditing(false);
                  setName('');
                }}
              >
                <Text style={styles.buttonText}>{t('cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.addButtonText}>+ {t('add')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t('accountType')}</Text>
        <Text style={styles.value}>
          {user?.is_admin ? '👑 ' + t('accountType') : '✨ ' + t('name')}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t('language')}</Text>
        <Text style={styles.value}>{user?.language?.toUpperCase() || 'EN'}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>🚪 {t('logout')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0B0B0E',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#111217',
    borderBottomWidth: 2,
    borderBottomColor: '#EF5350',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginRight: 8,
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#F4F4F5',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F4F4F5',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#111217',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    marginHorizontal: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#EF5350',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#BDBDBD',
    marginBottom: 8,
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    color: '#F4F4F5',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#1A1A1F',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: '#0B0B0E',
    color: '#F4F4F5',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#EF5350',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  buttonText: {
    color: '#F4F4F5',
    fontWeight: '600',
    fontSize: 16,
  },
  editButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(239, 83, 80, 0.15)',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 83, 80, 0.3)',
  },
  editButtonText: {
    color: '#EF5350',
    fontWeight: '600',
  },
  addButton: {
    marginTop: 5,
    padding: 15,
    backgroundColor: '#EF5350',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#F4F4F5',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: '#EF5350',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
  },
  logoutButtonText: {
    color: '#F4F4F5',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

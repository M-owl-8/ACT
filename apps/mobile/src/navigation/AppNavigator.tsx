import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import JapaneseLoginScreen from '../screens/JapaneseLoginScreen';
import JapaneseRegisterScreen from '../screens/JapaneseRegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ProfileScreen from '../screens/ProfileScreen';
import IncomeScreen from '../screens/IncomeScreen';
import AddIncomeScreen from '../screens/AddIncomeScreen';
import EditIncomeScreen from '../screens/EditIncomeScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import EditExpenseScreen from '../screens/EditExpenseScreen';
import ReportsScreen from '../screens/ReportsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import MotivationScreen from '../screens/MotivationScreen';
import SettingsScreen from '../screens/SettingsScreen';
import BooksScreen from '../screens/BooksScreen';
import BookDetailScreen from '../screens/BookDetailScreen';
import { useAuthStore } from '../store/auth';
import { useTheme } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tabs for authenticated users
function MainTabs() {
  const { theme, mode } = useTheme();
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'IncomeTab') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'ExpensesTab') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'CalendarTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'MotivationTab') {
            iconName = focused ? 'flame' : 'flame-outline';
          } else if (route.name === 'BooksTab') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'ReportsTab') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="IncomeTab" 
        component={IncomeScreen}
        options={{ tabBarLabel: t('income') }}
      />
      <Tab.Screen 
        name="ExpensesTab" 
        component={ExpensesScreen}
        options={{ tabBarLabel: t('expenses') }}
      />
      <Tab.Screen 
        name="CalendarTab" 
        component={CalendarScreen}
        options={{ tabBarLabel: t('calendar') }}
      />
      <Tab.Screen 
        name="MotivationTab" 
        component={MotivationScreen}
        options={{ tabBarLabel: t('motivation') }}
      />
      <Tab.Screen 
        name="BooksTab" 
        component={BooksScreen}
        options={{ tabBarLabel: t('books') }}
      />
      <Tab.Screen 
        name="ReportsTab" 
        component={ReportsScreen}
        options={{ tabBarLabel: t('reports') }}
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsScreen}
        options={{ tabBarLabel: t('settings') }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{ tabBarLabel: t('profile') }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const user = useAuthStore((s) => s.user);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {user ? (
          // Authenticated screens
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabs}
            />
            <Stack.Screen 
              name="AddIncome" 
              component={AddIncomeScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="EditIncome" 
              component={EditIncomeScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="AddExpense" 
              component={AddExpenseScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="EditExpense" 
              component={EditExpenseScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="BookDetail" 
              component={BookDetailScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
          </>
        ) : (
          // Auth screens - Japanese themed
          <>
            <Stack.Screen 
              name="Login" 
              component={JapaneseLoginScreen}
            />
            <Stack.Screen 
              name="Register" 
              component={JapaneseRegisterScreen}
            />
            <Stack.Screen 
              name="ForgotPassword" 
              component={ForgotPasswordScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

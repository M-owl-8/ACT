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
import AddScreen from '../screens/AddScreen';
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

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AddTab') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'OverviewTab') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#f0f0f0',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        headerShown: false,
        tabBarLabel: ({ focused }) => {
          let label = '';
          if (route.name === 'HomeTab') label = 'Home';
          else if (route.name === 'AddTab') label = 'Add';
          else if (route.name === 'OverviewTab') label = 'Overview';
          else if (route.name === 'SettingsTab') label = 'Settings';
          
          return (
            <Ionicons 
              name={route.name === 'HomeTab' ? 'home' : 
                     route.name === 'AddTab' ? 'add-circle' :
                     route.name === 'OverviewTab' ? 'stats-chart' :
                     'settings'}
              size={0}
              color="transparent"
            />
          );
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={ExpensesScreen}
        options={{ 
          tabBarLabel: 'Home',
          tabBarLabelStyle: { fontSize: 12, fontWeight: '500', marginTop: 4 },
        }}
      />
      <Tab.Screen 
        name="AddTab" 
        component={AddScreen}
        options={{ 
          tabBarLabel: 'Add',
          tabBarLabelStyle: { fontSize: 12, fontWeight: '500', marginTop: 4 },
        }}
      />
      <Tab.Screen 
        name="OverviewTab" 
        component={CalendarScreen}
        options={{ 
          tabBarLabel: 'Overview',
          tabBarLabelStyle: { fontSize: 12, fontWeight: '500', marginTop: 4 },
        }}
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsScreen}
        options={{ 
          tabBarLabel: 'Settings',
          tabBarLabelStyle: { fontSize: 12, fontWeight: '500', marginTop: 4 },
        }}
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

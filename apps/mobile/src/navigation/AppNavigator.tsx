import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import ExpensesScreen from '../screens/ExpensesScreen';
import AddIncomeScreen from '../screens/AddIncomeScreen';
import EditIncomeScreen from '../screens/EditIncomeScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import EditExpenseScreen from '../screens/EditExpenseScreen';
import AddScreen from '../screens/AddScreen';
import ReportsScreen from '../screens/ReportsScreen';
import MotivationScreen from '../screens/MotivationScreen';
import ReminderScreen from '../screens/ReminderScreen';
import SettingsScreen from '../screens/SettingsScreen';

import { useTheme } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tabs for authenticated users
function MainTabs() {
  const { theme, mode } = useTheme();
  const { t, i18n } = useTranslation();
  // Force re-render when language changes
  const [languageKey, setLanguageKey] = React.useState(i18n.language);

  React.useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setLanguageKey(lng);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);
  
  return (
    <Tab.Navigator
      key={languageKey}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AddTab') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'ReportsTab') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'ReminderTab') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'GoalsTab') {
            iconName = focused ? 'flag' : 'flag-outline';
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
          if (route.name === 'HomeTab') label = t('home');
          else if (route.name === 'AddTab') label = t('add');
          else if (route.name === 'ReportsTab') label = t('reports');
          else if (route.name === 'ReminderTab') label = t('reminders');
          else if (route.name === 'GoalsTab') label = t('goals');
          else if (route.name === 'SettingsTab') label = t('settings');
          
          return (
            <Ionicons 
              name={route.name === 'HomeTab' ? 'home' : 
                     route.name === 'AddTab' ? 'add-circle' :
                     route.name === 'ReportsTab' ? 'bar-chart' :
                     route.name === 'ReminderTab' ? 'notifications' :
                     route.name === 'GoalsTab' ? 'flag' :
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
          tabBarLabel: t('home'),
          tabBarLabelStyle: { fontSize: 12, fontWeight: '500', marginTop: 4 },
        }}
      />
      <Tab.Screen 
        name="AddTab" 
        component={AddScreen}
        options={{ 
          tabBarLabel: t('add'),
          tabBarLabelStyle: { fontSize: 12, fontWeight: '500', marginTop: 4 },
        }}
      />
      <Tab.Screen 
        name="ReportsTab" 
        component={ReportsScreen}
        options={{ 
          tabBarLabel: t('reports'),
          tabBarLabelStyle: { fontSize: 12, fontWeight: '500', marginTop: 4 },
        }}
      />
      <Tab.Screen 
        name="ReminderTab" 
        component={ReminderScreen}
        options={{ 
          tabBarLabel: t('reminders'),
          tabBarLabelStyle: { fontSize: 12, fontWeight: '500', marginTop: 4 },
        }}
      />
      <Tab.Screen 
        name="GoalsTab" 
        component={MotivationScreen}
        options={{ 
          tabBarLabel: t('goals'),
          tabBarLabelStyle: { fontSize: 12, fontWeight: '500', marginTop: 4 },
        }}
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsScreen}
        options={{ 
          tabBarLabel: t('settings'),
          tabBarLabelStyle: { fontSize: 12, fontWeight: '500', marginTop: 4 },
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  // Always show main app - offline mode with local data only
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

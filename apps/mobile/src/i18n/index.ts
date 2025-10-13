import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources = {
  en: {
    translation: {
      // Auth
      welcome: 'Welcome to ACT Gen-1',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      createAccount: 'Create Account',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      
      // Navigation
      income: 'Income',
      expenses: 'Expenses',
      calendar: 'Calendar',
      motivation: 'Motivation',
      reports: 'Reports',
      settings: 'Settings',
      profile: 'Profile',
      
      // Income & Expenses
      addIncome: 'Add Income',
      addExpense: 'Add Expense',
      editIncome: 'Edit Income',
      editExpense: 'Edit Expense',
      amount: 'Amount',
      category: 'Category',
      date: 'Date',
      note: 'Note',
      description: 'Description',
      selectCategory: 'Select Category',
      selectDate: 'Select Date',
      
      // Calendar & Reminders
      reminders: 'Reminders',
      addReminder: 'Add Reminder',
      reminderTitle: 'Reminder Title',
      reminderTime: 'Reminder Time',
      upcoming: 'Upcoming',
      completed: 'Completed',
      markComplete: 'Mark Complete',
      
      // Reports
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses',
      balance: 'Balance',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      thisYear: 'This Year',
      byCategory: 'By Category',
      trend: 'Trend',
      
      // Settings
      preferences: 'Preferences',
      accountType: 'Account Type',
      language: 'Language',
      theme: 'Theme',
      currency: 'Currency',
      name: 'Name',
      dataExport: 'Data Export',
      exportCSV: 'Export as CSV',
      exportJSON: 'Export as JSON',
      about: 'About',
      version: 'Version',
      
      // Motivation
      dailyQuote: 'Daily Quote',
      financialTips: 'Financial Tips',
      achievements: 'Achievements',
      
      // Messages
      loginFailed: 'Login Failed',
      registrationFailed: 'Registration Failed',
      invalidCredentials: 'Invalid email or password',
      emailRequired: 'Email is required',
      passwordRequired: 'Password is required',
      passwordMinLength: 'Password must be at least 8 characters',
      passwordsDoNotMatch: 'Passwords do not match',
      invalidEmail: 'Invalid email address',
      networkError: 'Network error. Please check your connection.',
      success: 'Success',
      error: 'Error',
      confirmDelete: 'Are you sure you want to delete this item?',
      settingUpdated: 'Setting updated successfully',
      settingUpdateFailed: 'Failed to update setting',
      
      // Common
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      back: 'Back',
      add: 'Add',
      update: 'Update',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      close: 'Close',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      week: 'Week',
      month: 'Month',
      year: 'Year',
      all: 'All',
      none: 'None',
      total: 'Total',
    },
  },
  ru: {
    translation: {
      // Auth
      welcome: 'Добро пожаловать в ACT Gen-1',
      login: 'Войти',
      register: 'Регистрация',
      logout: 'Выйти',
      email: 'Электронная почта',
      password: 'Пароль',
      confirmPassword: 'Подтвердите пароль',
      createAccount: 'Создать аккаунт',
      signIn: 'Войти',
      signUp: 'Зарегистрироваться',
      
      // Navigation
      income: 'Доходы',
      expenses: 'Расходы',
      calendar: 'Календарь',
      motivation: 'Мотивация',
      reports: 'Отчеты',
      settings: 'Настройки',
      profile: 'Профиль',
      
      // Income & Expenses
      addIncome: 'Добавить доход',
      addExpense: 'Добавить расход',
      editIncome: 'Изменить доход',
      editExpense: 'Изменить расход',
      amount: 'Сумма',
      category: 'Категория',
      date: 'Дата',
      note: 'Заметка',
      description: 'Описание',
      selectCategory: 'Выберите категорию',
      selectDate: 'Выберите дату',
      
      // Calendar & Reminders
      reminders: 'Напоминания',
      addReminder: 'Добавить напоминание',
      reminderTitle: 'Название напоминания',
      reminderTime: 'Время напоминания',
      upcoming: 'Предстоящие',
      completed: 'Завершенные',
      markComplete: 'Отметить выполненным',
      
      // Reports
      totalIncome: 'Всего доходов',
      totalExpenses: 'Всего расходов',
      balance: 'Баланс',
      thisMonth: 'Этот месяц',
      lastMonth: 'Прошлый месяц',
      thisYear: 'Этот год',
      byCategory: 'По категориям',
      trend: 'Тренд',
      
      // Settings
      preferences: 'Предпочтения',
      accountType: 'Тип аккаунта',
      language: 'Язык',
      theme: 'Тема',
      currency: 'Валюта',
      name: 'Имя',
      dataExport: 'Экспорт данных',
      exportCSV: 'Экспорт в CSV',
      exportJSON: 'Экспорт в JSON',
      about: 'О приложении',
      version: 'Версия',
      
      // Motivation
      dailyQuote: 'Цитата дня',
      financialTips: 'Финансовые советы',
      achievements: 'Достижения',
      
      // Messages
      loginFailed: 'Ошибка входа',
      registrationFailed: 'Ошибка регистрации',
      invalidCredentials: 'Неверный email или пароль',
      emailRequired: 'Email обязателен',
      passwordRequired: 'Пароль обязателен',
      passwordMinLength: 'Пароль должен содержать минимум 8 символов',
      passwordsDoNotMatch: 'Пароли не совпадают',
      invalidEmail: 'Неверный email адрес',
      networkError: 'Ошибка сети. Проверьте подключение.',
      success: 'Успешно',
      error: 'Ошибка',
      confirmDelete: 'Вы уверены, что хотите удалить этот элемент?',
      settingUpdated: 'Настройка успешно обновлена',
      settingUpdateFailed: 'Не удалось обновить настройку',
      
      // Common
      loading: 'Загрузка...',
      save: 'Сохранить',
      cancel: 'Отмена',
      edit: 'Изменить',
      delete: 'Удалить',
      back: 'Назад',
      add: 'Добавить',
      update: 'Обновить',
      confirm: 'Подтвердить',
      yes: 'Да',
      no: 'Нет',
      ok: 'ОК',
      close: 'Закрыть',
      search: 'Поиск',
      filter: 'Фильтр',
      sort: 'Сортировка',
      today: 'Сегодня',
      yesterday: 'Вчера',
      tomorrow: 'Завтра',
      week: 'Неделя',
      month: 'Месяц',
      year: 'Год',
      all: 'Все',
      none: 'Нет',
      total: 'Всего',
    },
  },
  uz: {
    translation: {
      // Auth
      welcome: 'ACT Gen-1 ga xush kelibsiz',
      login: 'Kirish',
      register: "Ro'yxatdan o'tish",
      logout: 'Chiqish',
      email: 'Elektron pochta',
      password: 'Parol',
      confirmPassword: 'Parolni tasdiqlang',
      createAccount: 'Hisob yaratish',
      signIn: 'Kirish',
      signUp: "Ro'yxatdan o'tish",
      
      // Navigation
      income: 'Daromadlar',
      expenses: 'Xarajatlar',
      calendar: 'Kalendar',
      motivation: 'Motivatsiya',
      reports: 'Hisobotlar',
      settings: 'Sozlamalar',
      profile: 'Profil',
      
      // Income & Expenses
      addIncome: 'Daromad qo\'shish',
      addExpense: 'Xarajat qo\'shish',
      editIncome: 'Daromadni tahrirlash',
      editExpense: 'Xarajatni tahrirlash',
      amount: 'Miqdor',
      category: 'Kategoriya',
      date: 'Sana',
      note: 'Eslatma',
      description: 'Tavsif',
      selectCategory: 'Kategoriyani tanlang',
      selectDate: 'Sanani tanlang',
      
      // Calendar & Reminders
      reminders: 'Eslatmalar',
      addReminder: 'Eslatma qo\'shish',
      reminderTitle: 'Eslatma nomi',
      reminderTime: 'Eslatma vaqti',
      upcoming: 'Kelayotgan',
      completed: 'Bajarilgan',
      markComplete: 'Bajarilgan deb belgilash',
      
      // Reports
      totalIncome: 'Jami daromad',
      totalExpenses: 'Jami xarajat',
      balance: 'Balans',
      thisMonth: 'Bu oy',
      lastMonth: 'O\'tgan oy',
      thisYear: 'Bu yil',
      byCategory: 'Kategoriya bo\'yicha',
      trend: 'Tendentsiya',
      
      // Settings
      preferences: 'Sozlamalar',
      accountType: 'Hisob turi',
      language: 'Til',
      theme: 'Mavzu',
      currency: 'Valyuta',
      name: 'Ism',
      dataExport: 'Ma\'lumotlarni eksport qilish',
      exportCSV: 'CSV formatida eksport',
      exportJSON: 'JSON formatida eksport',
      about: 'Ilova haqida',
      version: 'Versiya',
      
      // Motivation
      dailyQuote: 'Kunlik iqtibos',
      financialTips: 'Moliyaviy maslahatlar',
      achievements: 'Yutuqlar',
      
      // Messages
      loginFailed: 'Kirish xatosi',
      registrationFailed: "Ro'yxatdan o'tish xatosi",
      invalidCredentials: 'Noto\'g\'ri email yoki parol',
      emailRequired: 'Email talab qilinadi',
      passwordRequired: 'Parol talab qilinadi',
      passwordMinLength: 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak',
      passwordsDoNotMatch: 'Parollar mos kelmaydi',
      invalidEmail: 'Noto\'g\'ri email manzil',
      networkError: 'Tarmoq xatosi. Ulanishni tekshiring.',
      success: 'Muvaffaqiyatli',
      error: 'Xato',
      confirmDelete: 'Ushbu elementni o\'chirmoqchimisiz?',
      settingUpdated: 'Sozlama muvaffaqiyatli yangilandi',
      settingUpdateFailed: 'Sozlamani yangilash amalga oshmadi',
      
      // Common
      loading: 'Yuklanmoqda...',
      save: 'Saqlash',
      cancel: 'Bekor qilish',
      edit: 'Tahrirlash',
      delete: "O'chirish",
      back: 'Orqaga',
      add: 'Qo\'shish',
      update: 'Yangilash',
      confirm: 'Tasdiqlash',
      yes: 'Ha',
      no: 'Yo\'q',
      ok: 'OK',
      close: 'Yopish',
      search: 'Qidirish',
      filter: 'Filtr',
      sort: 'Saralash',
      today: 'Bugun',
      yesterday: 'Kecha',
      tomorrow: 'Ertaga',
      week: 'Hafta',
      month: 'Oy',
      year: 'Yil',
      all: 'Hammasi',
      none: 'Yo\'q',
      total: 'Jami',
    },
  },
};

// Language detector for AsyncStorage
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        callback(savedLanguage);
      } else {
        callback('en');
      }
    } catch (error) {
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem('user-language', lng);
    } catch (error) {
      // Handle error silently
    }
  },
};

i18n
  .use(languageDetector as any)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    resources,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

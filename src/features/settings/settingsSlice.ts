import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SettingsState } from '@/types';
import { secureStorage } from '@/services/utils/secureStorage';
import { STORAGE_KEYS } from '@/constants';

const initialState: SettingsState = {
  biometricEnabled: false,
  backupEnabled: false,
  autoLockEnabled: true,
  autoLockTimeout: 300, // 5 minutes
  theme: 'auto',
  notificationsEnabled: true,
  lastBackup: null,
};

// Async thunks
export const loadSettings = createAsyncThunk(
  'settings/loadSettings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await secureStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return initialState;
      
      return JSON.parse(data) as SettingsState;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveSettings = createAsyncThunk(
  'settings/saveSettings',
  async (settings: SettingsState, { rejectWithValue }) => {
    try {
      await secureStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return settings;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setBiometricEnabled: (state, action: PayloadAction<boolean>) => {
      state.biometricEnabled = action.payload;
    },
    setBackupEnabled: (state, action: PayloadAction<boolean>) => {
      state.backupEnabled = action.payload;
    },
    setAutoLockEnabled: (state, action: PayloadAction<boolean>) => {
      state.autoLockEnabled = action.payload;
    },
    setAutoLockTimeout: (state, action: PayloadAction<number>) => {
      state.autoLockTimeout = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.notificationsEnabled = action.payload;
    },
    setLastBackup: (state, action: PayloadAction<string>) => {
      state.lastBackup = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadSettings.fulfilled, (_state, action) => {
      return action.payload;
    });
    builder.addCase(saveSettings.fulfilled, (_state, action) => {
      return action.payload;
    });
  },
});

export const {
  setBiometricEnabled,
  setBackupEnabled,
  setAutoLockEnabled,
  setAutoLockTimeout,
  setTheme,
  setNotificationsEnabled,
  setLastBackup,
} = settingsSlice.actions;

export default settingsSlice.reducer;

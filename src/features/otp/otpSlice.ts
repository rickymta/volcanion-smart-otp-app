import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OtpState, OtpAccount, AddOtpRequest, VerifyOtpRequest } from '@/types';
import { otpService } from '@/services/api/otpService';
import { encryptionService } from '@/services/utils/encryptionService';
import { secureStorage } from '@/services/utils/secureStorage';
import { STORAGE_KEYS } from '@/constants';

const initialState: OtpState = {
  accounts: [],
  isLoading: false,
  error: null,
  syncStatus: 'idle',
  lastSync: null,
};

// Async thunks
export const fetchAccounts = createAsyncThunk(
  'otp/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await otpService.getAccounts();
      
      // Decrypt secrets locally
      const decryptedAccounts = await Promise.all(
        response.accounts.map(async (account) => ({
          ...account,
          secret: await encryptionService.decrypt(account.secret),
        }))
      );
      
      // Cache locally
      await secureStorage.setItem(
        STORAGE_KEYS.OTP_ACCOUNTS,
        JSON.stringify(decryptedAccounts)
      );
      
      return decryptedAccounts;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addAccount = createAsyncThunk(
  'otp/addAccount',
  async (data: AddOtpRequest, { rejectWithValue }) => {
    try {
      // Encrypt secret before sending to server
      const encryptedSecret = await encryptionService.encrypt(data.secret);
      
      const response = await otpService.addAccount({
        ...data,
        secret: encryptedSecret,
      });
      
      // Return with decrypted secret for local use
      return {
        ...response.account,
        secret: data.secret, // Keep original unencrypted for local use
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateAccount = createAsyncThunk(
  'otp/updateAccount',
  async (
    { id, updates }: { id: string; updates: Partial<OtpAccount> },
    { rejectWithValue }
  ) => {
    try {
      const response = await otpService.updateAccount(id, updates);
      return response.account;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'otp/deleteAccount',
  async (id: string, { rejectWithValue }) => {
    try {
      await otpService.deleteAccount(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'otp/verifyOtp',
  async (data: VerifyOtpRequest, { rejectWithValue }) => {
    try {
      const response = await otpService.verifyOtp(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const syncAccounts = createAsyncThunk(
  'otp/syncAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await otpService.syncAccounts();
      
      const decryptedAccounts = await Promise.all(
        response.accounts.map(async (account) => ({
          ...account,
          secret: await encryptionService.decrypt(account.secret),
        }))
      );
      
      await secureStorage.setItem(
        STORAGE_KEYS.OTP_ACCOUNTS,
        JSON.stringify(decryptedAccounts)
      );
      
      return decryptedAccounts;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const loadLocalAccounts = createAsyncThunk(
  'otp/loadLocalAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await secureStorage.getItem(STORAGE_KEYS.OTP_ACCOUNTS);
      if (!data) return [];
      
      return JSON.parse(data) as OtpAccount[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const incrementHotpCounter = createAsyncThunk(
  'otp/incrementHotpCounter',
  async (accountId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { otp: OtpState };
      const account = state.otp.accounts.find((a) => a.id === accountId);
      
      if (!account || account.type !== 'HOTP') {
        throw new Error('Invalid HOTP account');
      }
      
      const newCounter = account.counter + 1;
      await otpService.updateAccount(accountId, { counter: newCounter });
      
      return { accountId, counter: newCounter };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const otpSlice = createSlice({
  name: 'otp',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateAccountLocally: (state, action: PayloadAction<OtpAccount>) => {
      const index = state.accounts.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.accounts[index] = action.payload;
      }
    },
    clearAccounts: (state) => {
      state.accounts = [];
      state.error = null;
      state.syncStatus = 'idle';
      state.lastSync = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch accounts
    builder.addCase(fetchAccounts.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAccounts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.accounts = action.payload;
      state.error = null;
    });
    builder.addCase(fetchAccounts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Add account
    builder.addCase(addAccount.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(addAccount.fulfilled, (state, action) => {
      state.isLoading = false;
      state.accounts.push(action.payload);
      state.error = null;
    });
    builder.addCase(addAccount.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Update account
    builder.addCase(updateAccount.fulfilled, (state, action) => {
      const index = state.accounts.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.accounts[index] = { ...state.accounts[index], ...action.payload };
      }
    });
    
    // Delete account
    builder.addCase(deleteAccount.fulfilled, (state, action) => {
      state.accounts = state.accounts.filter((a) => a.id !== action.payload);
    });
    
    // Sync accounts
    builder.addCase(syncAccounts.pending, (state) => {
      state.syncStatus = 'syncing';
    });
    builder.addCase(syncAccounts.fulfilled, (state, action) => {
      state.syncStatus = 'success';
      state.accounts = action.payload;
      state.lastSync = new Date().toISOString();
    });
    builder.addCase(syncAccounts.rejected, (state) => {
      state.syncStatus = 'error';
    });
    
    // Load local accounts
    builder.addCase(loadLocalAccounts.fulfilled, (state, action) => {
      state.accounts = action.payload;
    });
    
    // Increment HOTP counter
    builder.addCase(incrementHotpCounter.fulfilled, (state, action) => {
      const account = state.accounts.find((a) => a.id === action.payload.accountId);
      if (account) {
        account.counter = action.payload.counter;
      }
    });
  },
});

export const { clearError, updateAccountLocally, clearAccounts } = otpSlice.actions;
export default otpSlice.reducer;

import { NavigatorScreenParams } from '@react-navigation/native';
import { OtpAccount, PushOtpRequest } from '@/types';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  HomeTabs: NavigatorScreenParams<HomeTabsParamList>;
  AddOtp: undefined;
  OtpDetail: { account: OtpAccount };
  EditOtp: { account: OtpAccount };
  PushApproval: { request: PushOtpRequest };
  Backup: undefined;
  Recovery: undefined;
};

export type HomeTabsParamList = {
  Home: undefined;
  PushOtp: undefined;
  Settings: undefined;
};

import { EnumAppMode } from '../types';

const getAppMode = () => (process.env.NODE_ENV as EnumAppMode) || 'development';
export const isProduction = () => getAppMode() === EnumAppMode.PROD;
export const getServerId = () => process.env.SERVER_ID || '';
export const getHost = () => process.env.HOST || 'localhost';
export const getPort = () => Number(process.env.PORT) || 3000;

export const getInitAdminUsername = () => process.env.INIT_ADMIN_USERNAME || '';
export const getInitAdminPassword = () => process.env.INIT_ADMIN_PASSWORD || '';
export const getInitAdminEmail = () => process.env.INIT_ADMIN_EMAIL || '';

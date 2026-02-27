// API Services - Central export
export { default as api } from './api';
export { categoriesService } from './services/categories';
export { resourcesService } from './services/resources';
export { creditsService } from './services/credits';
export { authService } from './services/auth';
export { paymentsService } from './services/payments';
export { plansService } from './services/plans';
export { aiService } from './services/ai';

// Re-export types
export type { ResourceQueryParams } from './services/resources';
export type { CreditBalance, DownloadResult, DownloadHistoryItem } from './services/credits';
export type { LoginCredentials, RegisterData, AuthResponse } from './services/auth';

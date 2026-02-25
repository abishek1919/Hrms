// Design tokens for Smart HRMS
// Centralized values to ensure consistency across the app.

export const tokens = {
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { size: '24px', weight: 600 },
    h2: { size: '18px', weight: 600 },
    body: { size: '14px', weight: 400 },
    caption: { size: '12px', weight: 400 },
  },
  colors: {
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    success: '#16A34A',
    warning: '#F59E0B',
    danger: '#DC2626',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  elevation: {
    card: '0 1px 2px rgba(0,0,0,0.04)',
    border: '1px solid #E5E7EB',
    radius: '12px',
  },
};

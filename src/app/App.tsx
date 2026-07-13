import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminLogin } from '../components/admin/AdminLogin';
import { PortfolioPage } from '../components/public/PortfolioPage';
import { ProjectDetailPage } from '../components/public/ProjectDetailPage';
import { setDocumentLanguage } from '../features/i18n/config';
import { ThemeProvider } from '../features/theme/ThemeProvider';
import type { Locale } from '../types/cms';

export function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const applyLanguage = (language: string) => setDocumentLanguage((language.startsWith('ar') ? 'ar' : 'en') as Locale);
    applyLanguage(i18n.language);
    i18n.on('languageChanged', applyLanguage);
    return () => i18n.off('languageChanged', applyLanguage);
  }, [i18n]);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PortfolioPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </ThemeProvider>
  );
}

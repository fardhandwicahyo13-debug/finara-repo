import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeProvider';
import { AuthProvider } from './contexts/AuthProvider';
import { NotificationsProvider } from './contexts/NotificationsProvider';
import { ModalProvider } from './components/ui/ModalProvider';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import OverviewPage from './pages/Overview';
import TransactionsPage from './pages/Transactions';
import WalletsPage from './pages/Wallets';
import BudgetsPage from './pages/Budgets';
import SavingsGoalsPage from './pages/SavingsGoals';
import BillsPage from './pages/Bills';
import NotificationsPage from './pages/Notifications';
import ProfilePage from './pages/Profile';
import SettingsPage from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function AppContent() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <ThemeProvider>
          <ModalProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/"
                element={
                  <AppShell>
                    <OverviewPage />
                  </AppShell>
                }
              />
              <Route
                path="/transactions"
                element={
                  <AppShell>
                    <TransactionsPage />
                  </AppShell>
                }
              />
              <Route
                path="/wallets"
                element={
                  <AppShell>
                    <WalletsPage />
                  </AppShell>
                }
              />
              <Route
                path="/budgets"
                element={
                  <AppShell>
                    <BudgetsPage />
                  </AppShell>
                }
              />
              <Route
                path="/savings-goals"
                element={
                  <AppShell>
                    <SavingsGoalsPage />
                  </AppShell>
                }
              />
              <Route
                path="/bills"
                element={
                  <AppShell>
                    <BillsPage />
                  </AppShell>
                }
              />
              <Route
                path="/notifications"
                element={
                  <AppShell>
                    <NotificationsPage />
                  </AppShell>
                }
              />
              <Route
                path="/profile"
                element={
                  <AppShell>
                    <ProfilePage />
                  </AppShell>
                }
              />
              <Route
                path="/settings"
                element={
                  <AppShell>
                    <SettingsPage />
                  </AppShell>
                }
              />
            </Routes>
          </ModalProvider>
        </ThemeProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

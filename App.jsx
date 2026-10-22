import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider } from './context/AuthContext';

function MainApp() {
  const [activePage, setActivePage] = useState('home');

  return (
    <div className="flex flex-col min-h-screen bg-dark-900 text-slate-100">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1">
        {activePage === 'home' && <HomePage setActivePage={setActivePage} />}
        {activePage === 'dashboard' && <DashboardPage setActivePage={setActivePage} />}
        {activePage === 'history' && <HistoryPage setActivePage={setActivePage} />}
        {activePage === 'analytics' && <AnalyticsPage setActivePage={setActivePage} />}
        {activePage === 'about' && <AboutPage />}
        {activePage === 'login' && <LoginPage setActivePage={setActivePage} />}
        {activePage === 'register' && <RegisterPage setActivePage={setActivePage} />}
      </main>

      <Footer setActivePage={setActivePage} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

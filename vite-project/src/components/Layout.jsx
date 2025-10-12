import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useTelegram } from '../hooks/useTelegram';

const Layout = () => {
  // Инициализация Telegram WebApp
  useTelegram();

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="fade-in">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;


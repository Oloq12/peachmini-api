import React from 'react';
import { NavLink } from 'react-router-dom';
import { haptic } from '../utils/haptic';

const BottomNav = () => {
  const navItems = [
    {
      path: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Home',
    },
    {
      path: '/chats',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      label: 'Chats',
    },
    {
      path: '/create',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      label: 'Create',
      isMain: true,
    },
    {
      path: '/store',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      label: 'Store',
    },
    {
      path: '/settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Settings',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background-secondary border-t border-gray-800 z-50">
      <div className="max-w-screen-xl mx-auto px-2">
        <div className="flex justify-around items-center h-20">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => haptic.light()}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-200 ${
                  item.isMain
                    ? isActive
                      ? 'bg-primary text-white scale-110 -mt-4 p-4 shadow-lg shadow-primary/50'
                      : 'bg-primary/80 text-white scale-105 -mt-3 p-3'
                    : isActive
                    ? 'text-primary'
                    : 'text-gray-400 hover:text-gray-300'
                }`
              }
            >
              <div className="mb-1">{item.icon}</div>
              <span className={`text-xs font-medium ${item.isMain ? 'text-[10px]' : ''}`}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;


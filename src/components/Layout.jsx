import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar, Sidebar } from './common';
import { useDirection } from '../hooks/useDirection';
import { cn } from '../utils/helpers';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isRtl } = useDirection();

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div
        className={cn(
          'pt-16 h-full overflow-y-auto',
          isRtl ? 'lg:pr-64' : 'lg:pl-64'
        )}
      >
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
            <div className="max-w-6xl mx-auto animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

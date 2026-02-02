import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

const NO_LAYOUT_ROUTES = ['/', '/login', '/signup'];

export default function AppLayout() {
  const location = useLocation();
  const isPublicRoute = NO_LAYOUT_ROUTES.includes(location.pathname);

  if (isPublicRoute) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

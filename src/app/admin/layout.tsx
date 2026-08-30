import { ReactNode } from 'react';
import { checkAdmin, adminLogout } from './actions';
import AdminLoginPage from './AdminLoginPage';
import { AdminSidebar } from './AdminSidebar';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthorized } = await checkAdmin();

  if (!isAuthorized) {
    return <AdminLoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-gray-100 flex flex-col md:flex-row">
      <AdminSidebar logoutAction={adminLogout} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#121212] min-w-0">
        {children}
      </main>
    </div>
  );
}

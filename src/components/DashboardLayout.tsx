import { useState } from 'react';
import { Button } from './ui/button';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { cn } from './ui/utils';
import { 
  Building2, 
  LogOut, 
  User, 
  Menu, 
  X, 
  Home, 
  Clock, 
  FileText, 
  Plus, 
  Users,
  CheckCircle
} from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const employeeNavItems = [
    {
      title: 'Dashboard',
      href: '/dashboard/employee',
      icon: Home
    },
    {
      title: 'Pending eSign',
      href: '/dashboard/employee/pending',
      icon: Clock
    },
    {
      title: 'Signed Documents',
      href: '/dashboard/employee/documents',
      icon: CheckCircle
    }
  ];

  const hrNavItems = [
    {
      title: 'Dashboard',
      href: '/dashboard/hr',
      icon: Home
    },
    {
      title: 'All Requests',
      href: '/dashboard/hr/requests',
      icon: FileText
    },
    {
      title: 'Create Request',
      href: '/dashboard/hr/create',
      icon: Plus
    },
    {
      title: 'Manage Users',
      href: '/dashboard/hr/users',
      icon: Users
    }
  ];

  const navItems = user?.role === 'hr' ? hrNavItems : employeeNavItems;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="flex h-16 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold">eSign Portal</h1>
              <p className="text-xs text-muted-foreground">
                {user?.role === 'hr' ? 'HR Dashboard' : 'Employee Dashboard'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user?.name || user?.email}</span>
              <span className="text-muted-foreground">({user?.role})</span>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-sidebar border-r transition-transform duration-300 ease-in-out md:relative md:translate-x-0 min-h-screen",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex h-full min-h-screen flex-col">
            {/* Sidebar Header */}
            <div className="flex h-16 items-center border-b border-sidebar-border px-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-sidebar-primary rounded flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-sidebar-primary-foreground" />
                </div>
                <span className="font-semibold text-sidebar-foreground">Navigation</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
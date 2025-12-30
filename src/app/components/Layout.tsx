import logoImage from "../../assets/b1ebbfd3b371d2e268259be0cc206f19d81034a0.png";
import React, { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  User,
  BookOpen,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      path: "/schedule",
      icon: Calendar,
      label: "Jadwal",
    },
    {
      path: "/courses",
      icon: BookOpen,
      label: "Mata Kuliah",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img
                  src={logoImage}
                  alt="Logo UMM"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-gray-900">InfoKHS</h2>
                <p className="text-gray-600">Sistem</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900">{user?.name}</p>
                <p className="text-gray-600 uppercase">
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src={logoImage}
                  alt="Logo UMM"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-gray-900">InfoKHS</h1>
            </div>
            <div className="w-10" />
          </div>
        </header>

        {/* Page Content */}
        <main>{children}</main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
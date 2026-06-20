import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  BarChart3,
  Calendar,
  Moon,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '概览' },
  { to: '/cycles', icon: Calendar, label: '周期' },
  { to: '/checkin', icon: CheckSquare, label: '打卡' },
  { to: '/recovery', icon: Moon, label: '恢复' },
  { to: '/stats', icon: BarChart3, label: '统计' },
];

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-secondary/95 backdrop-blur-xl border-t border-bg-tertiary z-50">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

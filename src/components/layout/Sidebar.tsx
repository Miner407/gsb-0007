import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  BarChart3,
  Dumbbell,
  Calendar,
  Moon,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '概览' },
  { to: '/cycles', icon: Calendar, label: '训练周期' },
  { to: '/plans', icon: ClipboardList, label: '训练计划' },
  { to: '/checkin', icon: CheckSquare, label: '每日打卡' },
  { to: '/recovery', icon: Moon, label: '恢复管理' },
  { to: '/stats', icon: BarChart3, label: '数据统计' },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-bg-secondary border-r border-bg-tertiary sticky top-0">
      <div className="p-6 border-b border-bg-tertiary">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-glow">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl tracking-wide gradient-text">
              FIT TRACK
            </h1>
            <p className="text-xs text-text-muted">健身打卡助手</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-bg-tertiary">
        <div className="card p-4 bg-gradient-to-br from-accent/10 to-gold/5">
          <p className="text-sm text-text-muted mb-1">坚持就是胜利</p>
          <p className="text-lg font-display gradient-text">NO PAIN NO GAIN</p>
        </div>
      </div>
    </aside>
  );
}

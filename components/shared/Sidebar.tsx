'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  CalendarCheck, CreditCard, BarChart3, LogOut,
  Zap, Shield, User, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'teacher'] },
  { href: '/students', icon: Users, label: 'Talabalar', roles: ['admin', 'teacher'] },
  { href: '/teachers', icon: GraduationCap, label: "O'qituvchilar", roles: ['admin'] },
  { href: '/groups', icon: BookOpen, label: 'Guruhlar', roles: ['admin', 'teacher'] },
  { href: '/attendance', icon: CalendarCheck, label: 'Davomat', roles: ['admin', 'teacher'] },
  { href: '/payments', icon: CreditCard, label: "To'lovlar", roles: ['admin'] },
  { href: '/reports', icon: BarChart3, label: 'Hisobotlar', roles: ['admin'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success("Tizimdan chiqildi");
    router.push('/login');
  };

  const visible = navItems.filter(i => user && i.roles.includes(user.role));

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 z-40 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <motion.div className="flex items-center gap-3" whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 400 }}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Academix</h1>
            <p className="text-xs text-slate-500 font-medium">O'quv Markazi</p>
          </div>
        </motion.div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Menyu</p>
        {visible.map(({ href, icon: Icon, label }, i) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <motion.div
              key={href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={href}>
                <div className={cn('sidebar-link', isActive && 'active')}>
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="opacity-60" />}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-2 px-3 py-1.5 mb-2">
          {user?.role === 'admin'
            ? <Shield size={13} className="text-indigo-500" />
            : <User size={13} className="text-emerald-500" />}
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {user?.role === 'admin' ? 'Administrator' : "O'qituvchi"}
          </span>
        </div>
        <motion.div className="bg-indigo-50 rounded-xl p-4" whileHover={{ scale: 1.01 }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <motion.button
            onClick={handleLogout}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
          >
            <LogOut size={13} /> Chiqish
          </motion.button>
        </motion.div>
      </div>
    </aside>
  );
}

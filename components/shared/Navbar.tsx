'use client';

import { Bell, Search, Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

export default function Navbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user } = useAuthStore();
  return (
    <motion.header
      className="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-4 sticky top-0 z-30"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-1">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input placeholder="Qidirish..." className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 transition-all" />
        </div>
        <button className="relative w-9 h-9 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
          <Bell size={15} className="text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {user?.role === 'admin' ? <Shield size={9} className="text-indigo-500" /> : <User size={9} className="text-emerald-500" />}
              <p className="text-xs text-slate-400 leading-none">{user?.role === 'admin' ? 'Admin' : "O'qituvchi"}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

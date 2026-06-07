'use client';

import { useEffect, useState } from 'react';
import { Users, GraduationCap, BookOpen, TrendingUp, AlertCircle, CheckCircle, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { studentService, teacherService, groupService, paymentService, attendanceService } from '@/services/api';
import { Student, Teacher, Group, Payment, Attendance } from '@/types';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import { StatCardSkeleton } from '@/components/shared/Skeleton';
import Navbar from '@/components/shared/Navbar';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import Link from 'next/link';

const monthlyData = [
  { month: 'Iyul', tushumlar: 7200000, talabalar: 38 },
  { month: 'Avg', tushumlar: 8100000, talabalar: 42 },
  { month: 'Sep', tushumlar: 9400000, talabalar: 51 },
  { month: 'Okt', tushumlar: 10200000, talabalar: 58 },
  { month: 'Noy', tushumlar: 9800000, talabalar: 62 },
  { month: 'Dek', tushumlar: 11500000, talabalar: 67 },
];

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentService.getAll(),
      teacherService.getAll(),
      groupService.getAll(),
      paymentService.getAll(),
      attendanceService.getAll(),
    ]).then(([s, t, g, p, a]) => {
      setStudents(s.data);
      setTeachers(t.data);
      setGroups(g.data);
      setPayments(p.data);
      setAttendance(a.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const activeStudents = students.filter(s => s.status === 'active').length;
  const activeGroups = groups.filter(g => g.status === 'active').length;
  const monthlyRevenue = payments.filter(p => p.status === 'paid' && p.month.includes('Noyabr')).reduce((sum, p) => sum + p.amount, 0);
  const debtors = payments.filter(p => p.status === 'overdue' || p.status === 'pending').length;
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const attendanceRate = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;

  const recentPayments = [...payments].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()).slice(0, 5);
  const recentStudents = [...students].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const stats = [
    { label: 'Jami talabalar', value: students.length, sub: `${activeStudents} ta faol`, icon: Users, color: 'bg-blue-500', light: 'bg-blue-50', trend: '+12%', up: true },
    { label: "Jami o'qituvchilar", value: teachers.length, sub: 'Barcha mutaxassislar', icon: GraduationCap, color: 'bg-violet-500', light: 'bg-violet-50', trend: '+2', up: true },
    { label: 'Faol guruhlar', value: activeGroups, sub: `${groups.length} ta jami`, icon: BookOpen, color: 'bg-emerald-500', light: 'bg-emerald-50', trend: 'Barqaror', up: true },
    { label: 'Oylik tushum', value: formatCurrency(monthlyRevenue), sub: 'Noyabr 2024', icon: TrendingUp, color: 'bg-amber-500', light: 'bg-amber-50', trend: '+8%', up: true },
    { label: 'Qarzdor talabalar', value: debtors, sub: "To'lov muddati o'tgan", icon: AlertCircle, color: 'bg-rose-500', light: 'bg-rose-50', trend: '-3', up: false },
    { label: 'Davomat foizi', value: `${attendanceRate}%`, sub: 'Oxirgi 30 kun', icon: CheckCircle, color: 'bg-teal-500', light: 'bg-teal-50', trend: '+2%', up: true },
  ];

  return (
    <div>
      <Navbar title="Dashboard" subtitle="Umumiy ko'rinish va statistikalar" />
      <div className="p-6 space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array(6).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
            : stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.light} rounded-2xl flex items-center justify-center`}>
                    <stat.icon className={`text-${stat.color.split('-')[1]}-600`} size={22} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${stat.up ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                    {stat.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {stat.trend}
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
                <p className="text-sm font-semibold text-slate-700">{stat.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.sub}</p>
              </div>
            ))
          }
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Oylik tushum</h3>
                <p className="text-xs text-slate-500 mt-0.5">So'nggi 6 oy</p>
              </div>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">2024</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), 'Tushum']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Area type="monotone" dataKey="tushumlar" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorRevenue)" dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Talabalar o'sishi</h3>
                <p className="text-xs text-slate-500 mt-0.5">Oyma-oy</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Bar dataKey="talabalar" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent payments */}
          <div className="card">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">So'nggi to'lovlar</h3>
              <Link href="/payments" className="text-xs text-indigo-600 font-semibold hover:underline">Barchasi →</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {loading
                ? Array(5).fill(0).map((_, i) => <div key={i} className="p-4"><div className="skeleton-shimmer h-10 rounded-lg" /></div>)
                : recentPayments.map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
                      {p.studentName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{p.studentName}</p>
                      <p className="text-xs text-slate-400">{p.paymentDate} · {getStatusLabel(p.paymentMethod)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(p.amount)}</p>
                      <span className={`badge text-xs ${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Recent students */}
          <div className="card">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Yangi talabalar</h3>
              <Link href="/students" className="text-xs text-indigo-600 font-semibold hover:underline">Barchasi →</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {loading
                ? Array(5).fill(0).map((_, i) => <div key={i} className="p-4"><div className="skeleton-shimmer h-10 rounded-lg" /></div>)
                : recentStudents.map(s => (
                  <div key={s.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 text-xs font-bold flex-shrink-0">
                      {s.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{s.fullName}</p>
                      <p className="text-xs text-slate-400">{s.group} · {s.course}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-400">{s.createdAt}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

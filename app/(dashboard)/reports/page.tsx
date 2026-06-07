'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Users, CalendarCheck, CreditCard, Download, Filter } from 'lucide-react';
import { studentService, attendanceService, paymentService, groupService } from '@/services/api';
import { Student, Attendance, Payment, Group } from '@/types';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import Navbar from '@/components/shared/Navbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'students' | 'attendance' | 'finance'>('students');
  const [groupFilter, setGroupFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-12-31');

  useEffect(() => {
    Promise.all([studentService.getAll(), attendanceService.getAll(), paymentService.getAll(), groupService.getAll()])
      .then(([s, a, p, g]) => { setStudents(s.data); setAttendance(a.data); setPayments(p.data); setGroups(g.data); })
      .finally(() => setLoading(false));
  }, []);

  // Students by course
  const courseData = groups.map(g => ({
    name: g.name,
    talabalar: students.filter(s => s.groupId === g.id).length,
  })).filter(d => d.talabalar > 0);

  // Gender distribution
  const genderData = [
    { name: 'Erkak', value: students.filter(s => s.gender === 'male').length },
    { name: 'Ayol', value: students.filter(s => s.gender === 'female').length },
  ];

  // Attendance by status
  const attData = [
    { name: 'Keldi', value: attendance.filter(a => a.status === 'present').length },
    { name: 'Kelmadi', value: attendance.filter(a => a.status === 'absent').length },
    { name: 'Kech keldi', value: attendance.filter(a => a.status === 'late').length },
  ];

  // Payment by method
  const payMethodData = [
    { name: 'Naqd', value: payments.filter(p => p.paymentMethod === 'cash').reduce((s, p) => s + p.amount, 0) },
    { name: 'Karta', value: payments.filter(p => p.paymentMethod === 'card').reduce((s, p) => s + p.amount, 0) },
    { name: "O'tkazma", value: payments.filter(p => p.paymentMethod === 'transfer').reduce((s, p) => s + p.amount, 0) },
  ];

  const tabs = [
    { key: 'students', label: 'Talabalar', icon: Users },
    { key: 'attendance', label: 'Davomat', icon: CalendarCheck },
    { key: 'finance', label: 'Moliya', icon: CreditCard },
  ] as const;

  return (
    <div>
      <Navbar title="Hisobotlar" subtitle="Statistika va tahlillar" />
      <div className="p-6 space-y-5">
        {/* Filters */}
        <div className="card p-5">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">Filterlar:</span>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Guruh</label>
                <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="select-field">
                  <option value="all">Barcha guruhlar</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Dan</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Gacha</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field" />
              </div>
            </div>
            <button className="btn-secondary whitespace-nowrap"><Download size={15} /> Eksport</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <t.icon size={15} />{t.label}
            </button>
          ))}
        </div>

        {/* Students report */}
        {activeTab === 'students' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Jami talabalar', value: students.length, color: 'text-indigo-600' },
                { label: 'Faol', value: students.filter(s => s.status === 'active').length, color: 'text-emerald-600' },
                { label: 'Nofaol', value: students.filter(s => s.status === 'inactive').length, color: 'text-rose-600' },
                { label: 'Guruhlar', value: groups.length, color: 'text-violet-600' },
              ].map(s => (
                <div key={s.label} className="stat-card text-center">
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-slate-500 mt-2">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="card p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-5">Guruhlardagi talabalar</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={courseData} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 12 }} />
                    <Bar dataKey="talabalar" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-5">Jins taqsimoti</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                      {genderData.map((_, i) => <Cell key={i} fill={['#6366f1', '#f472b6'][i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 12 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Student table */}
            <div className="card overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Talabalar ro'yxati</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-slate-50 border-b border-slate-100">
                    <th className="table-header">Ism</th>
                    <th className="table-header">Guruh</th>
                    <th className="table-header">Kurs</th>
                    <th className="table-header">Jinsi</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Sana</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {students.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="table-cell font-medium text-slate-900">{s.fullName}</td>
                        <td className="table-cell"><span className="badge text-indigo-700 bg-indigo-50 border-indigo-100">{s.group}</span></td>
                        <td className="table-cell text-sm text-slate-600">{s.course}</td>
                        <td className="table-cell"><span className={`badge ${s.gender === 'male' ? 'text-blue-700 bg-blue-50 border-blue-100' : 'text-pink-700 bg-pink-50 border-pink-100'}`}>{getStatusLabel(s.gender)}</span></td>
                        <td className="table-cell"><span className={`badge ${getStatusColor(s.status)}`}>{getStatusLabel(s.status)}</span></td>
                        <td className="table-cell text-sm text-slate-500">{s.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Attendance report */}
        {activeTab === 'attendance' && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              {attData.map((d, i) => (
                <div key={d.name} className="stat-card text-center">
                  <p className="text-3xl font-bold" style={{ color: ['#10b981', '#ef4444', '#f59e0b'][i] }}>{d.value}</p>
                  <p className="text-sm text-slate-500 mt-2">{d.name}</p>
                </div>
              ))}
            </div>
            <div className="card p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-5">Davomat taqsimoti</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={attData} cx="50%" cy="50%" outerRadius={110} paddingAngle={3} dataKey="value" label={(entry) => `${entry.name}: ${entry.value}`}>
                    {attData.map((_, i) => <Cell key={i} fill={['#10b981', '#ef4444', '#f59e0b'][i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Finance report */}
        {activeTab === 'finance' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Jami tushum", value: formatCurrency(payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)), color: 'text-emerald-600' },
                { label: "To'langan", value: payments.filter(p => p.status === 'paid').length, color: 'text-indigo-600' },
                { label: "Kutilmoqda", value: payments.filter(p => p.status === 'pending').length, color: 'text-amber-600' },
                { label: "Muddati o'tgan", value: payments.filter(p => p.status === 'overdue').length, color: 'text-rose-600' },
              ].map(s => (
                <div key={s.label} className="stat-card text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-slate-500 mt-2">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="card p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-5">To'lov usullari bo'yicha</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={payMethodData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [formatCurrency(Number(v)), 'Summa']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 12 }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {payMethodData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card overflow-hidden">
              <div className="p-5 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-900">To'lovlar tarixi</h3></div>
              <table className="w-full">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  <th className="table-header">Talaba</th>
                  <th className="table-header">Summa</th>
                  <th className="table-header">Sana</th>
                  <th className="table-header">Usul</th>
                  <th className="table-header">Oy</th>
                  <th className="table-header">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="table-cell font-medium text-slate-900">{p.studentName}</td>
                      <td className="table-cell font-bold text-slate-900">{formatCurrency(p.amount)}</td>
                      <td className="table-cell text-sm text-slate-600">{p.paymentDate}</td>
                      <td className="table-cell"><span className="badge text-slate-600 bg-slate-50 border-slate-200">{getStatusLabel(p.paymentMethod)}</span></td>
                      <td className="table-cell text-sm text-slate-600">{p.month}</td>
                      <td className="table-cell"><span className={`badge ${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

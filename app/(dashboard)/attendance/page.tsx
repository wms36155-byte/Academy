'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, Check, X, Clock, Filter, Save } from 'lucide-react';
import { attendanceService, groupService, studentService } from '@/services/api';
import { Attendance, Group, Student } from '@/types';
import Navbar from '@/components/shared/Navbar';
import { TableSkeleton } from '@/components/shared/Skeleton';
import toast from 'react-hot-toast';
import clsx from 'clsx';

type AttStatus = 'present' | 'absent' | 'late';

export default function AttendancePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState<Record<string, AttStatus>>({});

  useEffect(() => {
    Promise.all([groupService.getAll(), studentService.getAll(), attendanceService.getAll()])
      .then(([g, s, a]) => { setGroups(g.data); setStudents(s.data); setAttendance(a.data); })
      .catch(() => toast.error("Xato"))
      .finally(() => setLoading(false));
  }, []);

  const groupStudents = students.filter(s => s.groupId === selectedGroup);

  useEffect(() => {
    if (!selectedGroup || !selectedDate) return;
    const existing = attendance.filter(a => a.groupId === selectedGroup && a.date === selectedDate);
    const init: Record<string, AttStatus> = {};
    groupStudents.forEach(s => {
      const found = existing.find(a => a.studentId === s.id);
      init[s.id] = found ? found.status : 'present';
    });
    setStatuses(init);
  }, [selectedGroup, selectedDate, attendance.length]);

  const handleSave = async () => {
    if (!selectedGroup || !selectedDate) { toast.error("Guruh va sanani tanlang"); return; }
    setSaving(true);
    try {
      const existing = attendance.filter(a => a.groupId === selectedGroup && a.date === selectedDate);
      await Promise.all(existing.map(a => attendanceService.delete(a.id)));
      await Promise.all(groupStudents.map(s =>
        attendanceService.create({ studentId: s.id, groupId: selectedGroup, date: selectedDate, status: statuses[s.id] || 'present' })
      ));
      const res = await attendanceService.getAll();
      setAttendance(res.data);
      toast.success("Davomat saqlandi!");
    } catch { toast.error("Xato yuz berdi"); } finally { setSaving(false); }
  };

  const totalPresent = Object.values(statuses).filter(s => s === 'present').length;
  const totalAbsent = Object.values(statuses).filter(s => s === 'absent').length;
  const totalLate = Object.values(statuses).filter(s => s === 'late').length;

  // Stats from all attendance
  const allPresent = attendance.filter(a => a.status === 'present').length;
  const allTotal = attendance.length;
  const attendanceRate = allTotal ? Math.round((allPresent / allTotal) * 100) : 0;

  return (
    <div>
      <Navbar title="Davomat" subtitle="Talabalar davomatini boshqaring" />
      <div className="p-6 space-y-5">
        {/* Overview stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Umumiy davomat", value: `${attendanceRate}%`, color: "bg-indigo-50 text-indigo-700" },
            { label: "Kelgan", value: attendance.filter(a => a.status === 'present').length, color: "bg-emerald-50 text-emerald-700" },
            { label: "Kelmagan", value: attendance.filter(a => a.status === 'absent').length, color: "bg-red-50 text-red-700" },
            { label: "Kech kelgan", value: attendance.filter(a => a.status === 'late').length, color: "bg-amber-50 text-amber-700" },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium mt-1 opacity-80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="card p-5">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Guruhni tanlang</label>
              <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} className="select-field">
                <option value="">Guruhni tanlang</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name} – {g.course}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sana</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="input-field" />
            </div>
            <button onClick={handleSave} className="btn-primary" disabled={saving || !selectedGroup}>
              <Save size={15} /> {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </div>

        {selectedGroup && (
          <div className="card overflow-hidden">
            {/* Summary bar */}
            {groupStudents.length > 0 && (
              <div className="flex items-center gap-6 px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2 text-sm"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="font-semibold text-slate-700">{totalPresent} keldi</span></div>
                <div className="flex items-center gap-2 text-sm"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="font-semibold text-slate-700">{totalAbsent} kelmadi</span></div>
                <div className="flex items-center gap-2 text-sm"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span className="font-semibold text-slate-700">{totalLate} kech keldi</span></div>
              </div>
            )}
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-header">Talaba</th>
                  <th className="table-header">Guruh</th>
                  <th className="table-header text-center">Keldi</th>
                  <th className="table-header text-center">Kelmadi</th>
                  <th className="table-header text-center">Kech keldi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? <tr><td colSpan={5}><TableSkeleton rows={4} /></td></tr> :
                  groupStudents.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-sm text-slate-400">Bu guruhda talabalar yo'q</td></tr>
                  ) : groupStudents.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold', s.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500')}>
                            {s.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{s.fullName}</p>
                            <p className="text-xs text-slate-400">{s.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg">{s.group}</span>
                      </td>
                      {(['present', 'absent', 'late'] as AttStatus[]).map(status => (
                        <td key={status} className="table-cell text-center">
                          <button
                            onClick={() => setStatuses(prev => ({ ...prev, [s.id]: status }))}
                            className={clsx(
                              'w-9 h-9 mx-auto flex items-center justify-center rounded-xl border-2 transition-all',
                              statuses[s.id] === status
                                ? status === 'present' ? 'bg-emerald-500 border-emerald-500 text-white' :
                                  status === 'absent' ? 'bg-red-500 border-red-500 text-white' :
                                  'bg-amber-500 border-amber-500 text-white'
                                : 'border-slate-200 text-slate-300 hover:border-slate-300'
                            )}
                          >
                            {status === 'present' ? <Check size={15} /> : status === 'absent' ? <X size={15} /> : <Clock size={15} />}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}

        {!selectedGroup && !loading && (
          <div className="card py-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-5">
              <CalendarCheck className="text-indigo-400" size={36} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Guruhni tanlang</h3>
            <p className="text-sm text-slate-500">Davomat kiritish uchun guruh va sanani tanlang</p>
          </div>
        )}
      </div>
    </div>
  );
}

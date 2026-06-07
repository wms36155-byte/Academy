'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MapPin, Users, Calendar, BookOpen, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';
import { studentService, attendanceService, paymentService } from '@/services/api';
import { Student, Attendance, Payment } from '@/types';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import Navbar from '@/components/shared/Navbar';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    Promise.all([
      studentService.getById(id),
      attendanceService.getByStudent(id),
      paymentService.getByStudent(id),
    ]).then(([s, a, p]) => {
      setStudent(s.data);
      setAttendance(a.data);
      setPayments(p.data);
    }).catch(() => toast.error("Ma'lumot yuklanmadi")).finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div>
      <Navbar title="Talaba profili" />
      <div className="p-6"><div className="skeleton-shimmer h-64 rounded-2xl" /></div>
    </div>
  );
  if (!student) return <div className="p-6 text-slate-500">Talaba topilmadi</div>;

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;
  const attendanceRate = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <Navbar title="Talaba profili" subtitle={student.fullName} />
      <div className="p-6 space-y-5">
        <button onClick={() => router.back()} className="btn-secondary">
          <ArrowLeft size={15} /> Orqaga
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Profile card */}
          <div className="card p-6 flex flex-col items-center text-center">
            <div className={clsx('w-24 h-24 rounded-3xl flex items-center justify-center text-white text-3xl font-bold mb-4', student.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500')}>
              {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{student.fullName}</h2>
            <p className="text-sm text-slate-500 mt-1">{student.course}</p>
            <span className={`badge mt-3 ${getStatusColor(student.status)}`}>{getStatusLabel(student.status)}</span>

            <div className="w-full mt-6 space-y-3 text-left">
              {[
                { icon: Phone, label: student.phone },
                { icon: Phone, label: `Ota-ona: ${student.parentPhone}` },
                { icon: MapPin, label: student.address },
                { icon: Users, label: `Guruh: ${student.group}` },
                { icon: Calendar, label: `Yosh: ${student.age}` },
                { icon: Calendar, label: `Ro'yxatga olingan: ${student.createdAt}` },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-sm text-slate-600">
                  <Icon size={15} className="text-slate-400 flex-shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats & data */}
          <div className="lg:col-span-2 space-y-5">
            {/* Attendance stats */}
            <div className="card p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-600" /> Davomat statistikasi
              </h3>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {[
                  { label: 'Jami', value: attendance.length, color: 'text-slate-700', bg: 'bg-slate-100' },
                  { label: 'Keldi', value: presentCount, color: 'text-emerald-700', bg: 'bg-emerald-100' },
                  { label: 'Kelmadi', value: absentCount, color: 'text-red-700', bg: 'bg-red-100' },
                  { label: 'Kech', value: lateCount, color: 'text-amber-700', bg: 'bg-amber-100' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-600 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                  <div className="bg-indigo-600 h-2.5 rounded-full transition-all" style={{ width: `${attendanceRate}%` }} />
                </div>
                <span className="text-sm font-bold text-indigo-600">{attendanceRate}%</span>
              </div>

              {attendance.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Oxirgi davomatlar</p>
                  {attendance.slice(-5).reverse().map(a => (
                    <div key={a.id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                      {a.status === 'present' ? <CheckCircle size={15} className="text-emerald-500" /> :
                       a.status === 'absent' ? <XCircle size={15} className="text-red-500" /> :
                       <Clock size={15} className="text-amber-500" />}
                      <span className="text-sm text-slate-700">{a.date}</span>
                      <span className={`badge ml-auto ${getStatusColor(a.status)}`}>{getStatusLabel(a.status)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payments */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard size={16} className="text-indigo-600" /> To'lovlar tarixi
                </h3>
                <span className="text-sm font-bold text-emerald-600">{formatCurrency(totalPaid)}</span>
              </div>
              {payments.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">To'lovlar mavjud emas</p>
              ) : (
                <div className="space-y-2">
                  {payments.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{p.month}</p>
                        <p className="text-xs text-slate-400">{p.paymentDate} · {getStatusLabel(p.paymentMethod)}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(p.amount)}</p>
                      <span className={`badge ${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

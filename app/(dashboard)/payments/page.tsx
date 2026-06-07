'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Plus, Search, Edit2, Trash2, X, TrendingUp, AlertCircle } from 'lucide-react';
import { paymentService, studentService } from '@/services/api';
import { Payment, Student } from '@/types';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import Navbar from '@/components/shared/Navbar';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';
import { TableSkeleton } from '@/components/shared/Skeleton';
import toast from 'react-hot-toast';

const schema = z.object({
  studentId: z.string().min(1, "Talabani tanlang"),
  studentName: z.string().optional().default(''),
  amount: z.coerce.number().min(1000),
  paymentDate: z.string().min(1),
  paymentMethod: z.enum(['cash', 'card', 'transfer']),
  status: z.enum(['paid', 'pending', 'overdue']),
  month: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

const ITEMS_PER_PAGE = 8;

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPayment, setEditPayment] = useState<Payment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'debtors'>('all');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const fetchAll = async () => {
    try {
      const [p, s] = await Promise.all([paymentService.getAll(), studentService.getAll()]);
      setPayments(p.data); setStudents(s.data);
    } catch { toast.error("Xato"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const watchStudentId = watch('studentId');
  useEffect(() => {
    if (watchStudentId) {
      const s = students.find(st => st.id === watchStudentId);
      if (s) setValue('studentName', s.fullName);
    }
  }, [watchStudentId, students, setValue]);

  const openAdd = () => {
    setEditPayment(null);
    reset({ studentId: '', studentName: '', amount: 800000, paymentDate: new Date().toISOString().slice(0, 10), paymentMethod: 'cash', status: 'paid', month: '' });
    setModalOpen(true);
  };

  const openEdit = (p: Payment) => {
    setEditPayment(p); reset({ ...p }); setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editPayment) { await paymentService.update(editPayment.id, data); toast.success("Yangilandi!"); }
      else { await paymentService.create(data as Omit<Payment, 'id'>); toast.success("Qo'shildi!"); }
      setModalOpen(false); fetchAll();
    } catch { toast.error("Xato"); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try { await paymentService.delete(deleteId); toast.success("O'chirildi"); setDeleteId(null); fetchAll(); }
    catch { toast.error("Xato"); } finally { setSaving(false); }
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRevenue = payments.filter(p => p.status === 'paid' && p.paymentDate === todayStr).reduce((s, p) => s + p.amount, 0);
  const monthlyRevenue = payments.filter(p => p.status === 'paid' && p.paymentDate.startsWith('2024-11')).reduce((s, p) => s + p.amount, 0);
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const debtors = payments.filter(p => p.status === 'overdue' || p.status === 'pending');

  let filtered = payments.filter(p => {
    const matchSearch = p.studentName.toLowerCase().includes(search.toLowerCase()) || p.month.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (activeTab === 'debtors') filtered = filtered.filter(p => p.status === 'overdue' || p.status === 'pending');

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      <Navbar title="To'lovlar" subtitle="Moliya boshqaruvi" />
      <div className="p-6 space-y-5">
        {/* Revenue stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Bugungi tushum", value: formatCurrency(todayRevenue), icon: CreditCard, color: "from-blue-500 to-indigo-600" },
            { label: "Oylik tushum", value: formatCurrency(monthlyRevenue), icon: TrendingUp, color: "from-emerald-500 to-teal-600" },
            { label: "Umumiy tushum", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "from-violet-500 to-purple-600" },
            { label: "Qarzdorlar", value: `${debtors.length} ta`, icon: AlertCircle, color: "from-rose-500 to-red-600" },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white`}>
              <s.icon size={20} className="opacity-80 mb-3" />
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs opacity-80 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          <button onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Barcha to'lovlar
          </button>
          <button onClick={() => { setActiveTab('debtors'); setCurrentPage(1); }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'debtors' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Qarzdorlar {debtors.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs">{debtors.length}</span>}
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Talaba nomi, oy..." className="input-field pl-9" />
            </div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="select-field w-auto">
              <option value="all">Barcha status</option>
              <option value="paid">To'langan</option>
              <option value="pending">Kutilmoqda</option>
              <option value="overdue">Muddati o'tgan</option>
            </select>
          </div>
          <button onClick={openAdd} className="btn-primary whitespace-nowrap"><Plus size={16} /> To'lov qo'shish</button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="table-header">Talaba</th>
                  <th className="table-header">Summa</th>
                  <th className="table-header">Sana</th>
                  <th className="table-header">Usul</th>
                  <th className="table-header">Oy</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? <tr><td colSpan={7}><TableSkeleton rows={6} /></td></tr> :
                  paginated.length === 0 ? <tr><td colSpan={7}><EmptyState icon={CreditCard} title="To'lovlar topilmadi" description="Hali to'lov mavjud emas" /></td></tr> :
                  paginated.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 text-xs font-bold">
                            {p.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{p.studentName}</span>
                        </div>
                      </td>
                      <td className="table-cell font-bold text-slate-900">{formatCurrency(p.amount)}</td>
                      <td className="table-cell text-sm text-slate-600">{p.paymentDate}</td>
                      <td className="table-cell">
                        <span className="badge text-slate-600 bg-slate-50 border-slate-200">{getStatusLabel(p.paymentMethod)}</span>
                      </td>
                      <td className="table-cell text-sm text-slate-600">{p.month}</td>
                      <td className="table-cell"><span className={`badge ${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span></td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteId(p.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          {!loading && filtered.length > ITEMS_PER_PAGE && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} />
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">{editPayment ? "To'lovni tahrirlash" : "To'lov qo'shish"}</h2>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Talaba *</label>
                  <select {...register('studentId')} className="select-field">
                    <option value="">Tanlang</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                  </select>
                  {errors.studentId && <p className="text-xs text-red-500 mt-1">{errors.studentId.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Summa (so'm) *</label>
                  <input {...register('amount')} type="number" className="input-field" placeholder="800000" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">To'lov sanasi *</label>
                  <input {...register('paymentDate')} type="date" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">To'lov usuli *</label>
                  <select {...register('paymentMethod')} className="select-field">
                    <option value="cash">Naqd</option>
                    <option value="card">Karta</option>
                    <option value="transfer">O'tkazma</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status *</label>
                  <select {...register('status')} className="select-field">
                    <option value="paid">To'langan</option>
                    <option value="pending">Kutilmoqda</option>
                    <option value="overdue">Muddati o'tgan</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Oy *</label>
                  <input {...register('month')} className="input-field" placeholder="Noyabr 2024" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Bekor</button>
                <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteId} title="To'lovni o'chirish" message="Bu to'lovni o'chirishni tasdiqlaysizmi?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={saving} />
    </div>
  );
}

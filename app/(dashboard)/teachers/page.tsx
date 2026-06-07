'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Plus, Search, Edit2, Trash2, X, Phone, Briefcase, Star } from 'lucide-react';
import { teacherService } from '@/services/api';
import { Teacher } from '@/types';
import { formatCurrency } from '@/lib/utils';
import Navbar from '@/components/shared/Navbar';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';
import { TableSkeleton } from '@/components/shared/Skeleton';
import toast from 'react-hot-toast';

const schema = z.object({
  fullName: z.string().min(3),
  phone: z.string().min(9),
  specialization: z.string().min(2),
  salary: z.coerce.number().min(1000000),
  experience: z.coerce.number().min(0),
  image: z.string().optional().default(''),
  groups: z.array(z.string()).optional().default([]),
  createdAt: z.string().optional().default(new Date().toISOString().slice(0, 10)),
});
type FormData = z.infer<typeof schema>;

const specializations = ['Frontend Development', 'Backend Development', 'UI/UX Design', 'Mobile Development', 'Data Science', 'DevOps'];
const ITEMS_PER_PAGE = 8;

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const fetchTeachers = async () => {
    try {
      const res = await teacherService.getAll();
      setTeachers(res.data);
    } catch { toast.error("Xato yuz berdi"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTeachers(); }, []);

  const openEdit = (t: Teacher) => {
    setEditTeacher(t);
    reset({ fullName: t.fullName, phone: t.phone, specialization: t.specialization, salary: t.salary, experience: t.experience, image: t.image, groups: t.groups, createdAt: t.createdAt });
    setModalOpen(true);
  };

  const openAdd = () => {
    setEditTeacher(null);
    reset({ fullName: '', phone: '', specialization: '', salary: 3000000, experience: 1, image: '', groups: [], createdAt: new Date().toISOString().slice(0, 10) });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editTeacher) { await teacherService.update(editTeacher.id, data); toast.success("Yangilandi!"); }
      else { await teacherService.create(data as Omit<Teacher, 'id'>); toast.success("Qo'shildi!"); }
      setModalOpen(false); fetchTeachers();
    } catch { toast.error("Xato"); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try { await teacherService.delete(deleteId); toast.success("O'chirildi"); setDeleteId(null); fetchTeachers(); }
    catch { toast.error("Xato"); } finally { setSaving(false); }
  };

  const filtered = teachers.filter(t =>
    t.fullName.toLowerCase().includes(search.toLowerCase()) ||
    t.specialization.toLowerCase().includes(search.toLowerCase()) ||
    t.phone.includes(search)
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const specColors: Record<string, string> = {
    'Frontend Development': 'bg-blue-100 text-blue-700',
    'Backend Development': 'bg-violet-100 text-violet-700',
    'UI/UX Design': 'bg-pink-100 text-pink-700',
    'Mobile Development': 'bg-emerald-100 text-emerald-700',
    'Data Science': 'bg-amber-100 text-amber-700',
    'DevOps': 'bg-rose-100 text-rose-700',
  };

  return (
    <div>
      <Navbar title="O'qituvchilar" subtitle={`Jami ${teachers.length} ta o'qituvchi`} />
      <div className="p-6 space-y-5">
        <div className="flex gap-3 items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ism, mutaxassislik..." className="input-field pl-9" />
          </div>
          <button onClick={openAdd} className="btn-primary"><Plus size={16} /> O'qituvchi qo'shish</button>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array(6).fill(0).map((_, i) => <div key={i} className="card p-5 space-y-3"><div className="skeleton-shimmer h-20 rounded-xl" /><div className="skeleton-shimmer h-4 w-3/4 rounded" /><div className="skeleton-shimmer h-3 w-1/2 rounded" /></div>)
            : paginated.length === 0
              ? <div className="col-span-full"><EmptyState icon={GraduationCap} title="O'qituvchilar topilmadi" description="Qidiruv shartlariga mos o'qituvchi yo'q" /></div>
              : paginated.map(t => (
                <div key={t.id} className="card p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-indigo-200">
                      {t.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(t)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"><Edit2 size={13} /></button>
                      <button onClick={() => setDeleteId(t.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{t.fullName}</h3>
                  <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-lg ${specColors[t.specialization] || 'bg-slate-100 text-slate-600'}`}>{t.specialization}</span>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone size={12} /><span>{t.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Star size={12} /><span>{t.experience} yil tajriba</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Briefcase size={12} /><span>{t.groups.length} ta guruh</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500">Oylik maosh</p>
                    <p className="text-sm font-bold text-indigo-600">{formatCurrency(t.salary)}</p>
                  </div>
                </div>
              ))
          }
        </div>

        {!loading && filtered.length > ITEMS_PER_PAGE && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} />
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">{editTeacher ? "O'qituvchini tahrirlash" : "O'qituvchi qo'shish"}</h2>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">To'liq ism *</label>
                  <input {...register('fullName')} className="input-field" placeholder="Ism Familiya" />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">Kamida 3 ta harf</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Telefon *</label>
                  <input {...register('phone')} className="input-field" placeholder="+998901111111" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mutaxassislik *</label>
                  <select {...register('specialization')} className="select-field">
                    <option value="">Tanlang</option>
                    {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Maosh (so'm) *</label>
                  <input {...register('salary')} type="number" className="input-field" placeholder="5000000" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tajriba (yil) *</label>
                  <input {...register('experience')} type="number" className="input-field" placeholder="3" />
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

      <ConfirmDialog isOpen={!!deleteId} title="O'qituvchini o'chirish" message="Bu o'qituvchini o'chirishni tasdiqlaysizmi?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={saving} />
    </div>
  );
}

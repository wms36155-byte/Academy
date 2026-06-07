'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Plus, Search, Edit2, Trash2, X, Users, Clock, Calendar, MapPin } from 'lucide-react';
import { groupService, teacherService } from '@/services/api';
import { Group, Teacher } from '@/types';
import Navbar from '@/components/shared/Navbar';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const schema = z.object({
  name: z.string().min(2),
  course: z.string().min(2),
  teacherId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  lessonDays: z.array(z.string()).min(1),
  lessonTime: z.string().min(1),
  room: z.string().min(1),
  studentsCount: z.coerce.number().min(0),
  status: z.enum(['active', 'inactive']),
});
type FormData = z.infer<typeof schema>;

const allDays = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const courses = ['Frontend Development', 'Backend Development', 'UI/UX Design', 'Mobile Development', 'Data Science', 'DevOps'];
const ITEMS_PER_PAGE = 9;

const courseColors: Record<string, string> = {
  'Frontend Development': 'from-blue-500 to-indigo-600',
  'Backend Development': 'from-violet-500 to-purple-600',
  'UI/UX Design': 'from-pink-500 to-rose-600',
  'Mobile Development': 'from-emerald-500 to-teal-600',
  'Data Science': 'from-amber-500 to-orange-600',
  'DevOps': 'from-slate-500 to-gray-600',
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const fetchAll = async () => {
    try {
      const [g, t] = await Promise.all([groupService.getAll(), teacherService.getAll()]);
      setGroups(g.data); setTeachers(t.data);
    } catch { toast.error("Xato"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const toggleDay = (day: string) => {
    const next = selectedDays.includes(day) ? selectedDays.filter(d => d !== day) : [...selectedDays, day];
    setSelectedDays(next);
    setValue('lessonDays', next);
  };

  const openAdd = () => {
    setEditGroup(null);
    setSelectedDays([]);
    reset({ name: '', course: '', teacherId: '', startDate: '', endDate: '', lessonDays: [], lessonTime: '', room: '', studentsCount: 0, status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (g: Group) => {
    setEditGroup(g);
    setSelectedDays(g.lessonDays);
    reset({ ...g });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editGroup) { await groupService.update(editGroup.id, data); toast.success("Yangilandi!"); }
      else { await groupService.create(data as Omit<Group, 'id'>); toast.success("Qo'shildi!"); }
      setModalOpen(false); fetchAll();
    } catch { toast.error("Xato"); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try { await groupService.delete(deleteId); toast.success("O'chirildi"); setDeleteId(null); fetchAll(); }
    catch { toast.error("Xato"); } finally { setSaving(false); }
  };

  const filtered = groups.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.course.toLowerCase().includes(search.toLowerCase());
    const matchCourse = courseFilter === 'all' || g.course === courseFilter;
    return matchSearch && matchCourse;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.fullName || '–';

  return (
    <div>
      <Navbar title="Guruhlar" subtitle={`Jami ${groups.length} ta guruh`} />
      <div className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Guruh, kurs..." className="input-field pl-9" />
            </div>
            <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="select-field w-auto">
              <option value="all">Barcha kurslar</option>
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={openAdd} className="btn-primary whitespace-nowrap"><Plus size={16} /> Guruh qo'shish</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array(6).fill(0).map((_, i) => <div key={i} className="card overflow-hidden"><div className="skeleton-shimmer h-28" /><div className="p-5 space-y-3"><div className="skeleton-shimmer h-4 w-3/4 rounded" /><div className="skeleton-shimmer h-3 w-1/2 rounded" /></div></div>)
            : paginated.length === 0
              ? <div className="col-span-full"><EmptyState icon={BookOpen} title="Guruhlar topilmadi" description="Qidiruv shartlariga mos guruh yo'q" /></div>
              : paginated.map(g => (
                <div key={g.id} className="card overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
                  <div className={`h-24 bg-gradient-to-br ${courseColors[g.course] || 'from-slate-500 to-gray-600'} p-5 flex items-start justify-between`}>
                    <div>
                      <span className="text-white/70 text-xs font-medium">{g.course}</span>
                      <h3 className="text-xl font-bold text-white mt-1">{g.name}</h3>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${g.status === 'active' ? 'bg-white/20 text-white' : 'bg-black/20 text-white/70'}`}>
                      {g.status === 'active' ? 'Faol' : 'Nofaol'}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="space-y-2.5 mb-4">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Users size={13} className="text-slate-400" /><span>{getTeacherName(g.teacherId)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Clock size={13} className="text-slate-400" /><span>{g.lessonTime} · {g.lessonDays.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin size={13} className="text-slate-400" /><span>{g.room}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Calendar size={13} className="text-slate-400" /><span>{g.startDate} → {g.endDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1">
                          {Array.from({ length: Math.min(g.studentsCount, 4) }).map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-600">{i + 1}</div>
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">{g.studentsCount} ta talaba</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(g)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"><Edit2 size={13} /></button>
                        <button onClick={() => setDeleteId(g.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          }
        </div>

        {!loading && filtered.length > ITEMS_PER_PAGE && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} />
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content max-w-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">{editGroup ? 'Guruhni tahrirlash' : "Guruh qo'shish"}</h2>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Guruh nomi *</label>
                  <input {...register('name')} className="input-field" placeholder="FE-03" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kurs *</label>
                  <select {...register('course')} className="select-field">
                    <option value="">Tanlang</option>
                    {courses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">O'qituvchi *</label>
                  <select {...register('teacherId')} className="select-field">
                    <option value="">Tanlang</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Xona *</label>
                  <input {...register('room')} className="input-field" placeholder="101-xona" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Boshlanish *</label>
                  <input {...register('startDate')} type="date" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tugash *</label>
                  <input {...register('endDate')} type="date" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Dars vaqti *</label>
                  <input {...register('lessonTime')} type="time" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                  <select {...register('status')} className="select-field">
                    <option value="active">Faol</option>
                    <option value="inactive">Nofaol</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Dars kunlari *</label>
                  <div className="flex flex-wrap gap-2">
                    {allDays.map(day => (
                      <button key={day} type="button" onClick={() => toggleDay(day)}
                        className={clsx('px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all', selectedDays.includes(day) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300')}>
                        {day}
                      </button>
                    ))}
                  </div>
                  {errors.lessonDays && <p className="text-xs text-red-500 mt-1">Kamida 1 kun tanlang</p>}
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
      <ConfirmDialog isOpen={!!deleteId} title="Guruhni o'chirish" message="Bu guruhni o'chirishni tasdiqlaysizmi?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={saving} />
    </div>
  );
}

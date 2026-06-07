'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Search, Filter, Edit2, Trash2, Eye, Phone } from 'lucide-react';
import { studentService } from '@/services/api';
import { Student } from '@/types';
import { getStatusColor, getStatusLabel, formatCurrency } from '@/lib/utils';
import Navbar from '@/components/shared/Navbar';
import StudentModal from '@/components/students/StudentModal';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';
import { TableSkeleton } from '@/components/shared/Skeleton';
import toast from 'react-hot-toast';
import Link from 'next/link';
import clsx from 'clsx';

const ITEMS_PER_PAGE = 8;

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchStudents = async () => {
    try {
      const res = await studentService.getAll();
      setStudents(res.data);
    } catch {
      toast.error("Ma'lumotlarni yuklashda xato");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const filtered = students.filter(s => {
    const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) || s.group.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchGender = genderFilter === 'all' || s.gender === genderFilter;
    return matchSearch && matchStatus && matchGender;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSubmit = async (data: Omit<Student, 'id'>) => {
    setSaving(true);
    try {
      if (editStudent) {
        await studentService.update(editStudent.id, data);
        toast.success("Talaba muvaffaqiyatli yangilandi!");
      } else {
        await studentService.create(data);
        toast.success("Talaba muvaffaqiyatli qo'shildi!");
      }
      setModalOpen(false);
      setEditStudent(null);
      fetchStudents();
    } catch {
      toast.error("Xato yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await studentService.delete(deleteId);
      toast.success("Talaba o'chirildi");
      setDeleteId(null);
      fetchStudents();
    } catch {
      toast.error("O'chirishda xato");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Navbar title="Talabalar" subtitle={`Jami ${students.length} ta talaba`} />
      <div className="p-6 space-y-5">
        {/* Header actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Ism, telefon, guruh..."
                className="input-field pl-9"
              />
            </div>
            <div className="flex gap-2">
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="select-field w-auto">
                <option value="all">Barcha status</option>
                <option value="active">Faol</option>
                <option value="inactive">Nofaol</option>
              </select>
              <select value={genderFilter} onChange={e => { setGenderFilter(e.target.value); setCurrentPage(1); }} className="select-field w-auto">
                <option value="all">Barcha jins</option>
                <option value="male">Erkak</option>
                <option value="female">Ayol</option>
              </select>
            </div>
          </div>
          <button onClick={() => { setEditStudent(null); setModalOpen(true); }} className="btn-primary whitespace-nowrap">
            <Plus size={16} /> Talaba qo'shish
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="table-header">Talaba</th>
                  <th className="table-header">Telefon</th>
                  <th className="table-header">Guruh</th>
                  <th className="table-header">Kurs</th>
                  <th className="table-header">Jinsi</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Sana</th>
                  <th className="table-header text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={8}><TableSkeleton rows={6} /></td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={8}><EmptyState icon={Users} title="Talabalar topilmadi" description="Qidiruv shartlariga mos talabalar yo'q" /></td></tr>
                ) : paginated.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0', s.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500')}>
                          {s.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{s.fullName}</p>
                          <p className="text-xs text-slate-400">{s.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone size={13} className="text-slate-400" />
                        <span className="text-sm">{s.phone}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg">
                        {s.group}
                      </span>
                    </td>
                    <td className="table-cell text-sm text-slate-600 max-w-36 truncate">{s.course}</td>
                    <td className="table-cell">
                      <span className={`badge ${s.gender === 'male' ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-pink-700 bg-pink-50 border-pink-200'}`}>
                        {getStatusLabel(s.gender)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusColor(s.status)}`}>{getStatusLabel(s.status)}</span>
                    </td>
                    <td className="table-cell text-sm text-slate-500">{s.createdAt}</td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/students/${s.id}`}>
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors">
                            <Eye size={15} />
                          </button>
                        </Link>
                        <button onClick={() => { setEditStudent(s); setModalOpen(true); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => setDeleteId(s.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length > ITEMS_PER_PAGE && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} />
          )}
        </div>
      </div>

      <StudentModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditStudent(null); }} onSubmit={handleSubmit} student={editStudent} loading={saving} />
      <ConfirmDialog isOpen={!!deleteId} title="Talabani o'chirish" message="Bu talabani o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={saving} />
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User } from 'lucide-react';
import { Student } from '@/types';

const schema = z.object({
  fullName: z.string().min(3, "Ism kamida 3 harf bo'lishi kerak"),
  phone: z.string().min(9, "Telefon raqam noto'g'ri"),
  parentPhone: z.string().min(9, "Telefon raqam noto'g'ri"),
  age: z.coerce.number().min(10).max(60),
  gender: z.enum(['male', 'female']),
  course: z.string().min(1, "Kursni tanlang"),
  group: z.string().min(1, "Guruhni kiriting"),
  groupId: z.string().optional().default(''),
  address: z.string().min(5, "Manzilni kiriting"),
  status: z.enum(['active', 'inactive']),
  image: z.string().optional().default(''),
  createdAt: z.string().optional().default(new Date().toISOString().slice(0, 10)),
});

type FormData = z.infer<typeof schema>;

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  student?: Student | null;
  loading?: boolean;
}

const courses = ['Frontend Development', 'Backend Development', 'UI/UX Design', 'Mobile Development', 'Data Science', 'DevOps'];

export default function StudentModal({ isOpen, onClose, onSubmit, student, loading }: StudentModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (student) {
      reset({ ...student, groupId: student.groupId || '', image: student.image || '' });
    } else {
      reset({ fullName: '', phone: '', parentPhone: '', age: 18, gender: 'male', course: '', group: '', address: '', status: 'active', image: '', createdAt: new Date().toISOString().slice(0, 10) });
    }
  }, [student, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <User className="text-indigo-600" size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{student ? 'Talabani tahrirlash' : 'Yangi talaba qo\'shish'}</h2>
              <p className="text-xs text-slate-500">Barcha maydonlarni to'ldiring</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">To'liq ism *</label>
              <input {...register('fullName')} className="input-field" placeholder="Ism Familiya" />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Telefon *</label>
              <input {...register('phone')} className="input-field" placeholder="+998901234567" />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ota-ona telefoni *</label>
              <input {...register('parentPhone')} className="input-field" placeholder="+998901234567" />
              {errors.parentPhone && <p className="text-xs text-red-500 mt-1">{errors.parentPhone.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Yosh *</label>
              <input {...register('age')} type="number" className="input-field" placeholder="18" />
              {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jinsi *</label>
              <select {...register('gender')} className="select-field">
                <option value="male">Erkak</option>
                <option value="female">Ayol</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kurs *</label>
              <select {...register('course')} className="select-field">
                <option value="">Kursni tanlang</option>
                {courses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.course && <p className="text-xs text-red-500 mt-1">{errors.course.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Guruh nomi *</label>
              <input {...register('group')} className="input-field" placeholder="FE-01" />
              {errors.group && <p className="text-xs text-red-500 mt-1">{errors.group.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status *</label>
              <select {...register('status')} className="select-field">
                <option value="active">Faol</option>
                <option value="inactive">Nofaol</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Manzil *</label>
              <input {...register('address')} className="input-field" placeholder="Toshkent, Yunusobod" />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Bekor qilish</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Saqlanmoqda...' : student ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

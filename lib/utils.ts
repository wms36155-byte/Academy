import { twMerge } from 'tailwind-merge';
import { clsx, ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";

export const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const getStatusLabel = (status: string): string => ({
  active: 'Faol', inactive: 'Nofaol',
  present: 'Keldi', absent: 'Kelmadi', late: 'Kech keldi',
  paid: "To'langan", pending: 'Kutilmoqda', overdue: "Muddati o'tgan",
  male: 'Erkak', female: 'Ayol',
  cash: 'Naqd', card: 'Karta', transfer: "O'tkazma",
}[status] || status);

export const getStatusColor = (status: string): string => ({
  active: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  inactive: 'text-gray-600 bg-gray-50 border-gray-200',
  present: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  absent: 'text-red-700 bg-red-50 border-red-200',
  late: 'text-amber-700 bg-amber-50 border-amber-200',
  paid: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  overdue: 'text-red-700 bg-red-50 border-red-200',
}[status] || 'text-gray-600 bg-gray-50 border-gray-200');

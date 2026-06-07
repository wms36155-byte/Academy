import axios from 'axios';
import { Student, Teacher, Group, Attendance, Payment } from '@/types';

const api = axios.create({ baseURL: 'http://localhost:5000' });

export const studentService = {
  getAll: () => api.get<Student[]>('/students'),
  getById: (id: string) => api.get<Student>(`/students/${id}`),
  create: (data: Omit<Student, 'id'>) => api.post<Student>('/students', data),
  update: (id: string, data: Partial<Student>) => api.patch<Student>(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
};

export const teacherService = {
  getAll: () => api.get<Teacher[]>('/teachers'),
  getById: (id: string) => api.get<Teacher>(`/teachers/${id}`),
  create: (data: Omit<Teacher, 'id'>) => api.post<Teacher>('/teachers', data),
  update: (id: string, data: Partial<Teacher>) => api.patch<Teacher>(`/teachers/${id}`, data),
  delete: (id: string) => api.delete(`/teachers/${id}`),
};

export const groupService = {
  getAll: () => api.get<Group[]>('/groups'),
  getById: (id: string) => api.get<Group>(`/groups/${id}`),
  create: (data: Omit<Group, 'id'>) => api.post<Group>('/groups', data),
  update: (id: string, data: Partial<Group>) => api.patch<Group>(`/groups/${id}`, data),
  delete: (id: string) => api.delete(`/groups/${id}`),
};

export const attendanceService = {
  getAll: () => api.get<Attendance[]>('/attendance'),
  getByGroup: (groupId: string) => api.get<Attendance[]>(`/attendance?groupId=${groupId}`),
  getByStudent: (studentId: string) => api.get<Attendance[]>(`/attendance?studentId=${studentId}`),
  create: (data: Omit<Attendance, 'id'>) => api.post<Attendance>('/attendance', data),
  update: (id: string, data: Partial<Attendance>) => api.patch<Attendance>(`/attendance/${id}`, data),
  delete: (id: string) => api.delete(`/attendance/${id}`),
};

export const paymentService = {
  getAll: () => api.get<Payment[]>('/payments'),
  getByStudent: (studentId: string) => api.get<Payment[]>(`/payments?studentId=${studentId}`),
  create: (data: Omit<Payment, 'id'>) => api.post<Payment>('/payments', data),
  update: (id: string, data: Partial<Payment>) => api.patch<Payment>(`/payments/${id}`, data),
  delete: (id: string) => api.delete(`/payments/${id}`),
};

export interface Student {
  id: string;
  fullName: string;
  phone: string;
  parentPhone: string;
  age: number;
  gender: 'male' | 'female';
  course: string;
  group: string;
  groupId: string;
  address: string;
  image: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Teacher {
  id: string;
  fullName: string;
  phone: string;
  specialization: string;
  salary: number;
  image: string;
  experience: number;
  groups: string[];
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  course: string;
  teacherId: string;
  startDate: string;
  endDate: string;
  lessonDays: string[];
  lessonTime: string;
  room: string;
  studentsCount: number;
  status: 'active' | 'inactive';
}

export interface Attendance {
  id: string;
  studentId: string;
  groupId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  status: 'paid' | 'pending' | 'overdue';
  month: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
}

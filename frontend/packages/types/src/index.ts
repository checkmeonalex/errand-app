export type UserRole = 'user' | 'runner' | 'admin';

export interface Profile {
  id: string;
  phone: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  trust_level: 'new' | 'verified' | 'trusted';
  rating: number;
  completion_count: number;
  created_at: string;
}

export type TaskStatus = 'posted' | 'accepted' | 'in-progress' | 'completed' | 'closed' | 'disputed';

export interface Task {
  id: string;
  creator_id: string;
  runner_id?: string;
  title: string;
  description: string;
  category: string;
  price: number;
  status: TaskStatus;
  otp?: string;
  location_start?: string;
  location_end?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  task_id: string;
  amount: number;
  status: 'pending' | 'escrow' | 'released' | 'refunded';
  created_at: string;
}

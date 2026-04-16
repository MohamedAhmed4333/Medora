// src/types.ts

export interface User {
  id: string;
  name: string;
  email: string;
  healthScore: number;
  appointmentsStats: {
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  createdAt: Date;
}

export interface Vital {
  bloodPressure: { systolic: number; diastolic: number };
  heartRate: number;
  createdAt: Date;
}
export type Student = {
  id: number;
  fullname: string;
  dob?: string | null;
  height?: number | null;
  weight?: number | null;
  parentId?: number | null;
};

export type Teacher = {
  id: number;
  fullname: string;
  phone?: string | null;
};

export type Classroom = {
  id: number;
  name: string;
  tuitionFee: number;
  teacherId?: number | null;
};

export type Parent = {
  id: number;
  fullname: string;
  phone?: string | null;
};

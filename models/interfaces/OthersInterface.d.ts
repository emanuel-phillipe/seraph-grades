export interface IActivity {
  _id?: ObjectId;
  name: string;
  description?: string;
  total: number;
  date?: Date;
  grade?: number;
}

export interface ISubject {
  _id?: ObjectId;
  name: string;
  teacher: string;
  total: number;
  activities?: Array<IActivity>
}

export interface IPhase {
  _id?: ObjectId;
  name: number;
  subjects: Array<ISubject>;
  total: number;
  actual: boolean;
}
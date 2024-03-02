import { MovementType } from "../../constants";

export interface Budget {
  id?: string;
  amount: number;
  expense: number;
  settings: {
    locked: {
      active: boolean;
      password: string;
    };
  };
}

export interface Movement {
  amount: number;
  id: number;
  description: string;
  type: MovementType;
  created_at?: string;
  category: Category;
  currency: number;
}

export interface Category {
  id: number;
  name: string;
}

import { CurrencyCode, MovementType } from "../../constants";

export interface Budget {
  id?: string;
  amount: number;
  expense: number;
  settings: {
    locked: {
      active: boolean;
    };
  };
}

export interface Movement {
  amount: number;
  id: number;
  description: string;
  type: MovementType;
  created_at: string;
  category: Category;
  currency: CurrencyCode;
  rate: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Draft {
  id: number;
  amount: number;
  currency: CurrencyCode;
  type: MovementType;
  description: string | null;
  category_id: number | null;
  bank: string | null;
  date: string | null;
  subject: string | null;
  created_at: string;
}

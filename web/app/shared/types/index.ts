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
}

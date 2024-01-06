import { MovementType } from "../(default)/constants";

export interface Budget {
  id?: string;
  amount: number;
  income: number;
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
}

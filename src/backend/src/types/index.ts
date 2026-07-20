export type TxKind = "income" | "expense" | "transfer";

export type AccountKind = "Conta corrente" | "Conta digital" | "Investimentos" | string;

export interface TransactionDTO {
  id: string;
  merchant: string;
  category: string;
  kind: TxKind;
  amount: number;
  date: string;
  account: string | null;
  note: string | null;
  createdAt: string;
}

export interface CardDTO {
  id: string;
  name: string;
  brand: string;
  last4: string;
  limit: number;
  used: number;
  dueDay: number;
  color: string | null;
}

export interface AccountDTO {
  id: string;
  name: string;
  kind: AccountKind;
  balance: number;
}

export interface GoalDTO {
  id: string;
  title: string;
  saved: number;
  target: number;
}

export interface CategoryDTO {
  id: string;
  name: string;
  icon: string | null;
  spent: number;
  limit: number;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  avatarInitials: string | null;
}

export interface PaginatedResponse<T> {
  [key: string]: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}

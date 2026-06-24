import type { Database } from "./database";

export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserProfile = User;

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
}

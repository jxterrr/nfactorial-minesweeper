export type UserRow = {
  id: string;
  email: string | null;
  city: string | null;
  /** Free-only build: always treat as the default tier. */
  plan: string;
  created_at: string;
};

import type { Admin } from "./admin.entity.ts";

export interface IAdminRepository {
  findByEmail(email: string): Promise<Admin | null>;
  findById(id: string): Promise<Admin | null>;
  update(email: string, updateData: Partial<Admin>): Promise<void>;
}

import type { Admin } from "../entities/admin.entity.ts";

export interface IAdminRepository {
  findByEmail(email: string): Promise<Admin | null>;
  findById(id: string): Promise<Admin | null>;
  update(email: string, updateData: Partial<Admin>): Promise<void>;
}

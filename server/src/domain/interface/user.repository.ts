import type { IBaseRepository } from "./IBaseRepository.ts";
import type { User } from "../entities/user.entity.ts";

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  update(user: Partial<User>, email: string): Promise<void>;
  findAll(): Promise<User[]>;
  toggleBlockStatus(id: string, isBlocked: boolean): Promise<void>;
}
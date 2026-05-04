import type { User } from "./user.entity.ts";

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  update(user: Partial<User>, email: string): Promise<void>;
  findAll(): Promise<User[]>;
  toggleBlockStatus(id: string, isBlocked: boolean): Promise<void>;
}
import { UserRepository } from "@/infrastructure/repositories/user.repository.impl.ts";

const repo = new UserRepository();

export const getUsers = async () => {
  return await repo.findAll();
};

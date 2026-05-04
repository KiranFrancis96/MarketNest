import { UserRepository } from "@/infrastructure/repositories/user.repository.impl.ts";

const repo = new UserRepository();

export const unblockUser = async (id: string) => {
  await repo.toggleBlockStatus(id, false);
};

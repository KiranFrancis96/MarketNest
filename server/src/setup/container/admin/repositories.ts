import { AdminRepository } from "@/infrastructure/database/repositoryImpl/admin.repository.impl.ts";
import { UserRepository } from "@/infrastructure/database/repositoryImpl/user.repository.impl.ts";
import { MerchantRepository } from "@/infrastructure/database/repositoryImpl/merchant.repository.impl.ts";

export const adminRepository = new AdminRepository();
export const userRepository = new UserRepository();
export const merchantRepository = new MerchantRepository();

import { AdminController } from "@/presentation/http/controllers/admin.controller.ts";
import * as useCases from "./useCases.ts";

export const adminController = new AdminController(
  useCases.adminLoginUseCase,
  useCases.approveMerchantUseCase,
  useCases.blockMerchantUseCase,
  useCases.blockUserUseCase,
  useCases.forgotPasswordUseCase,
  useCases.getMerchantsUseCase,
  useCases.getPendingMerchantsUseCase,
  useCases.getUsersUseCase,
  useCases.rejectMerchantUseCase,
  useCases.resendAdminOtpUseCase,
  useCases.resetPasswordUseCase,
  useCases.unblockMerchantUseCase,
  useCases.unblockUserUseCase
);

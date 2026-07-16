import { MerchantController } from "@/presentation/http/controllers/merchant.controller.ts";
import * as useCases from "./useCases.ts";

export const merchantController = new MerchantController(
  useCases.registerMerchantUseCase,
  useCases.verifyMerchantOtpUseCase,
  useCases.loginMerchantUseCase,
  useCases.forgotMerchantPasswordUseCase,
  useCases.resetMerchantPasswordUseCase,
  useCases.getMerchantProfileUseCase,
  useCases.resendMerchantOtpUseCase,
  useCases.reapplyMerchantUseCase,
  useCases.logoutMerchantUseCase,
  useCases.googleMerchantAuthUseCase,
  useCases.completeMerchantProfileUseCase,
  useCases.updateMerchantProfileUseCase
);

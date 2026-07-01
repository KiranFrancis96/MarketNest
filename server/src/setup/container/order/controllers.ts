import { OrderController } from "@/presentation/http/controllers/order.controller.ts";
import * as useCases from "./useCases.ts";

export const orderController = new OrderController(
  useCases.createOrderUseCase,
  useCases.verifyPaymentUseCase,
  useCases.getOrderByIdUseCase,
  useCases.getUserOrdersUseCase,
  useCases.getMerchantSalesUseCase,
  useCases.getAdminUserOrdersUseCase,
  useCases.getAdminMerchantSalesUseCase,
  useCases.updateMerchantOrderItemStatusUseCase,
  useCases.updateUserOrderItemStatusUseCase
);

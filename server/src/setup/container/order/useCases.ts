import { orderRepository, cartRepository, productRepository } from "./repositories.ts";
import { CreateOrderUseCase } from "@/application/useCases/order/createOrder.usecase.ts";
import { VerifyPaymentUseCase } from "@/application/useCases/order/verifyPayment.usecase.ts";
import { GetOrderByIdUseCase } from "@/application/useCases/order/getOrderById.usecase.ts";
import { GetUserOrdersUseCase } from "@/application/useCases/order/getUserOrders.usecase.ts";
import { GetMerchantSalesUseCase } from "@/application/useCases/order/getMerchantSales.usecase.ts";
import { GetAdminUserOrdersUseCase } from "@/application/useCases/order/getAdminUserOrders.usecase.ts";
import { GetAdminMerchantSalesUseCase } from "@/application/useCases/order/getAdminMerchantSales.usecase.ts";
import { UpdateMerchantOrderItemStatusUseCase } from "@/application/useCases/order/updateMerchantOrderItemStatus.usecase.ts";
import { notificationService } from "@/setup/container/notification/repositories.ts";

export const createOrderUseCase = new CreateOrderUseCase(cartRepository, orderRepository, productRepository);
export const verifyPaymentUseCase = new VerifyPaymentUseCase(cartRepository, orderRepository, productRepository);
export const getOrderByIdUseCase = new GetOrderByIdUseCase(orderRepository);
export const getUserOrdersUseCase = new GetUserOrdersUseCase(orderRepository);
export const getMerchantSalesUseCase = new GetMerchantSalesUseCase(orderRepository, productRepository);
export const getAdminUserOrdersUseCase = new GetAdminUserOrdersUseCase(orderRepository);
export const getAdminMerchantSalesUseCase = new GetAdminMerchantSalesUseCase(orderRepository, productRepository);
export const updateMerchantOrderItemStatusUseCase = new UpdateMerchantOrderItemStatusUseCase(
  orderRepository,
  productRepository,
  notificationService
);

import { UpdateUserOrderItemStatusUseCase } from "@/application/useCases/order/updateUserOrderItemStatus.usecase.ts";

export const updateUserOrderItemStatusUseCase = new UpdateUserOrderItemStatusUseCase(
  orderRepository,
  productRepository,
  notificationService
);

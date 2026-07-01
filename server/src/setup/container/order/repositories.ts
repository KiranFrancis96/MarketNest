import { OrderRepository } from "@/infrastructure/database/repositoryImpl/order.repository.impl.ts";
import { cartRepository } from "../cart/repositories.ts";
import { productRepository } from "../product/repositories.ts";

export const orderRepository = new OrderRepository();
export { cartRepository, productRepository };

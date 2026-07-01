import type { IGetMerchantSalesUseCase, MerchantSale, MerchantSaleItem } from "@/application/IUseCases/order/IOrderUseCases.ts";
import type { IOrderRepository } from "@/domain/interface/order.repository.ts";
import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import { ApiError } from "@/utils/apiError.ts";

export class GetMerchantSalesUseCase implements IGetMerchantSalesUseCase {
  constructor(
    private _orderRepository: IOrderRepository,
    private _productRepository: IProductRepository
  ) {}

  async execute(merchantId: string): Promise<MerchantSale[]> {
    // 1. Get all products owned by this merchant
    const merchantProducts = await this._productRepository.findMany({ merchantId });
    if (merchantProducts.length === 0) {
      return [];
    }

    const productIds = merchantProducts.map((p) => p._id!.toString());

    // 2. Find all paid orders that contain any of these product IDs
    const orders = await this._orderRepository.findMany({
      "items.productId": { $in: productIds },
      status: "paid"
    } as Record<string, unknown>);

    // 3. Map orders to return sales transactions specific to this merchant
    const sales = orders.map((order) => {
      // Filter out items not belonging to this merchant and map to include product details
      const merchantItems = order.items
        .filter((item) => productIds.includes(item.productId.toString()))
        .map((item) => {
          const product = merchantProducts.find((p) => p._id!.toString() === item.productId.toString());
          return {
            ...item,
            product
          };
        });

      // Compute subtotal for this merchant
      const subtotal = merchantItems.reduce(
        (sum, item) => sum + item.priceSnapshot * item.quantity,
        0
      );

      return {
        orderId: order._id,
        date: order.createdAt,
        customerName: order.shippingAddress.fullName,
        customerPhone: order.shippingAddress.phone,
        shippingAddress: order.shippingAddress,
        items: merchantItems,
        subtotal
      };
    });

    return sales;
  }
}

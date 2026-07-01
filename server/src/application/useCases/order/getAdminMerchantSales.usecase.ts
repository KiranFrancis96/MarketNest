import type { IGetAdminMerchantSalesUseCase, MerchantSale, MerchantSaleItem } from "@/application/IUseCases/order/IOrderUseCases.ts";
import type { IOrderRepository } from "@/domain/interface/order.repository.ts";
import type { IProductRepository } from "@/domain/interface/product.repository.ts";

export class GetAdminMerchantSalesUseCase implements IGetAdminMerchantSalesUseCase {
  constructor(
    private _orderRepository: IOrderRepository,
    private _productRepository: IProductRepository
  ) {}

  async execute(merchantId: string): Promise<MerchantSale[]> {
    const merchantProducts = await this._productRepository.findMany({ merchantId });
    if (merchantProducts.length === 0) {
      return [];
    }

    const productIds = merchantProducts.map((p) => p._id!.toString());

    const orders = await this._orderRepository.findMany({
      "items.productId": { $in: productIds },
      status: "paid"
    } as Record<string, unknown>);

    const sales = orders.map((order) => {
      const merchantItems = order.items
        .filter((item) => productIds.includes(item.productId.toString()))
        .map((item) => {
          const product = merchantProducts.find((p) => p._id!.toString() === item.productId.toString());
          return {
            ...item,
            product
          };
        });

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

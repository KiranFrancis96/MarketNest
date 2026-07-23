import type { Request, Response } from "express";
import mongoose from "mongoose";
import type {
  ICreateOrderUseCase,
  IVerifyPaymentUseCase,
  IGetOrderByIdUseCase,
  IGetUserOrdersUseCase,
  IGetMerchantSalesUseCase,
  IGetAdminUserOrdersUseCase,
  IGetAdminMerchantSalesUseCase,
  IUpdateMerchantOrderItemStatusUseCase,
  IUpdateUserOrderItemStatusUseCase,
} from "@/application/IUseCases/order/IOrderUseCases.ts";
import { UserModel } from "@/infrastructure/database/models/user.model.ts";
import { OrderModel } from "@/infrastructure/database/models/order.model.ts";
import { ProductModel } from "@/infrastructure/database/models/product.model.ts";
import { CartModel } from "@/infrastructure/database/models/cart.model.ts";
import { WalletTransactionModel } from "@/infrastructure/database/models/walletTransaction.model.ts";
import { recordWalletTransaction } from "@/application/services/walletTransaction.service.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_UNAUTHORIZED,
  MSG_SHIPPING_ADDRESS_REQUIRED,
  MSG_PAYMENT_TOKENS_REQUIRED,
  MSG_PAYMENT_VERIFIED_SUCCESS,
  MSG_ORDER_ID_REQUIRED,
  MSG_USER_ID_REQUIRED,
  MSG_MERCHANT_ID_REQUIRED,
  MSG_ORDER_ITEM_REQ_FIELDS,
  MSG_ORDER_INVALID_STATUS,
  MSG_ORDER_ITEM_STATUS_UPDATED_SUCCESS,
  MSG_ORDER_INVALID_STATUS_REQ,
  MSG_ORDER_ITEM_CANCELLED_SUCCESS,
  MSG_ORDER_ITEM_RETURN_SUCCESS,
  MSG_USER_NOT_FOUND,
  MSG_ORDER_NOT_FOUND,
  MSG_UNAUTHORIZED_ORDER_VERIFY,
} from "@/presentation/http/controllers/messages.constants.ts";

export class OrderController {
  constructor(
    private _createOrderUseCase: ICreateOrderUseCase,
    private _verifyPaymentUseCase: IVerifyPaymentUseCase,
    private _getOrderByIdUseCase: IGetOrderByIdUseCase,
    private _getUserOrdersUseCase: IGetUserOrdersUseCase,
    private _getMerchantSalesUseCase: IGetMerchantSalesUseCase,
    private _getAdminUserOrdersUseCase: IGetAdminUserOrdersUseCase,
    private _getAdminMerchantSalesUseCase: IGetAdminMerchantSalesUseCase,
    private _updateMerchantOrderItemStatusUseCase: IUpdateMerchantOrderItemStatusUseCase,
    private _updateUserOrderItemStatusUseCase: IUpdateUserOrderItemStatusUseCase
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }

    const { shippingAddress } = req.body;
    if (!shippingAddress) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_SHIPPING_ADDRESS_REQUIRED);
    }

    const result = await this._createOrderUseCase.execute({
      userId,
      shippingAddress
    });

    res.status(HttpStatus.CREATED).json(result);
  };

  verify = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_PAYMENT_TOKENS_REQUIRED);
    }

    const order = await this._verifyPaymentUseCase.execute({
      userId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    res.status(HttpStatus.OK).json({
      message: MSG_PAYMENT_VERIFIED_SUCCESS,
      order
    });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }

    const orderId = req.params.id;
    if (!orderId) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_ORDER_ID_REQUIRED);
    }

    const order = await this._getOrderByIdUseCase.execute(orderId, userId);
    res.status(HttpStatus.OK).json(order);
  };

  getUserHistory = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 2;

    const orders = await this._getUserOrdersUseCase.execute(userId);
    const total = orders.length;
    const paginatedOrders = orders.slice((page - 1) * limit, page * limit);

    res.status(HttpStatus.OK).json({
      orders: paginatedOrders,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  };

  getMerchantSalesHistory = async (req: Request, res: Response): Promise<void> => {
    const merchantId = req.merchant?.id || req.user?.id;
    if (!merchantId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }

    const sales = await this._getMerchantSalesUseCase.execute(merchantId);
    res.status(HttpStatus.OK).json(sales);
  };

  getAdminUserHistory = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    if (!userId) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_USER_ID_REQUIRED);
    }

    const orders = await this._getAdminUserOrdersUseCase.execute(userId);
    res.status(HttpStatus.OK).json(orders);
  };

  getAdminMerchantHistory = async (req: Request, res: Response): Promise<void> => {
    const merchantId = req.params.merchantId;
    if (!merchantId) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_MERCHANT_ID_REQUIRED);
    }

    const sales = await this._getAdminMerchantSalesUseCase.execute(merchantId);
    res.status(HttpStatus.OK).json(sales);
  };

  updateMerchantItemStatus = async (req: Request, res: Response): Promise<void> => {
    const merchantId = req.merchant?.id || req.user?.id;
    if (!merchantId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }

    const { orderId, productId, status } = req.body;
    if (!orderId || !productId || !status) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_ORDER_ITEM_REQ_FIELDS);
    }

    const validStatuses = ["pending", "processing", "shipped", "completed", "cancelled", "returned"];
    if (!validStatuses.includes(status)) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_ORDER_INVALID_STATUS + validStatuses.join(", "));
    }

    const order = await this._updateMerchantOrderItemStatusUseCase.execute({
      merchantId,
      orderId,
      productId,
      status
    });

    res.status(HttpStatus.OK).json({
      message: MSG_ORDER_ITEM_STATUS_UPDATED_SUCCESS,
      order
    });
  };

  updateUserItemStatus = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }

    const { orderId, productId, status } = req.body;
    if (!orderId || !productId || !status) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_ORDER_ITEM_REQ_FIELDS);
    }

    const validStatuses = ["cancelled", "returned"];
    if (!validStatuses.includes(status)) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_ORDER_INVALID_STATUS_REQ + validStatuses.join(", "));
    }

    const order = await this._updateUserOrderItemStatusUseCase.execute({
      userId,
      orderId,
      productId,
      status
    });

    res.status(HttpStatus.OK).json({
      message: status === "cancelled" ? MSG_ORDER_ITEM_CANCELLED_SUCCESS : MSG_ORDER_ITEM_RETURN_SUCCESS,
      order
    });
  };

  payWithWallet = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }

    const orderId = req.params.id;
    if (!orderId) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_ORDER_ID_REQUIRED);
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_ORDER_NOT_FOUND);
    }

    if (order.userId.toString() !== userId) {
      throw new ApiError(HttpStatus.FORBIDDEN, MSG_UNAUTHORIZED_ORDER_VERIFY);
    }

    if (order.status === "paid") {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Order is already paid");
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_USER_NOT_FOUND);
    }

    const totalAmount = order.totalAmount;
    const walletBalance = user.walletBalance || 0;

    if (walletBalance < totalAmount) {
      // Failed payment scenario: mark the order status as failed
      order.status = "failed";
      await order.save();
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Insufficient wallet balance",
        order
      });
      return;
    }

    // Success flow
    await UserModel.updateOne({ _id: userId }, { $inc: { walletBalance: -totalAmount } });

    order.status = "paid";
    await order.save();

    // Deduct stock for each product in order
    for (const item of order.items) {
      const product = await ProductModel.findById(item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    // Clear cart
    const cart = await CartModel.findOne({ userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    const paidCount = await OrderModel.countDocuments({ status: "paid" });
    const finalOrderNumber = order.orderNumber && order.orderNumber.startsWith("ORD-")
      ? order.orderNumber
      : `ORD-${10000 + paidCount}`;
    await OrderModel.updateOne({ _id: order._id }, { $set: { orderNumber: finalOrderNumber } });
    order.orderNumber = finalOrderNumber;

    const updatedUser = await UserModel.findById(userId);
    const newBal = updatedUser?.walletBalance || 0;

    await recordWalletTransaction({
      userId,
      type: "debit",
      amount: totalAmount,
      description: `Payment for Order #${order.orderNumber || order._id}`,
      balanceAfter: newBal,
      orderId: order._id,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Order paid successfully via wallet",
      order,
      walletBalance: newBal
    });
  };

  markAsFailed = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }

    const orderId = req.params.id;
    if (!orderId) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_ORDER_ID_REQUIRED);
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_ORDER_NOT_FOUND);
    }

    if (order.userId.toString() !== userId) {
      throw new ApiError(HttpStatus.FORBIDDEN, MSG_UNAUTHORIZED_ORDER_VERIFY);
    }

    if (order.status !== "failed") {
      await UserModel.updateOne({ _id: userId }, { $inc: { walletBalance: order.totalAmount } });
      order.status = "failed";
      await order.save();

      const updatedUser = await UserModel.findById(userId);
      const newBal = updatedUser?.walletBalance || 0;

      await recordWalletTransaction({
        userId,
        type: "credit",
        amount: order.totalAmount,
        description: `Refund for Failed Payment (Order #${order.orderNumber || order._id})`,
        balanceAfter: newBal,
        orderId: order._id,
      });
    }

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Order payment failed. Refunded order amount to wallet.",
      order
    });
  };

  addWalletFunds = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
      }

      const { amount } = req.body;
      if (!amount || typeof amount !== "number" || amount <= 0) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Amount must be a positive number");
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        throw new ApiError(HttpStatus.NOT_FOUND, MSG_USER_NOT_FOUND);
      }

      await UserModel.updateOne({ _id: userId }, { $inc: { walletBalance: amount } });

      const updatedUser = await UserModel.findById(userId);
      const newBal = updatedUser?.walletBalance || 0;

      await recordWalletTransaction({
        userId,
        type: "credit",
        amount,
        description: "Funds Added to Wallet (Credit)",
        balanceAfter: newBal,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: "Wallet funds added successfully",
        walletBalance: newBal
      });
    } catch (err: any) {
      console.error("DEBUG addWalletFunds error:", err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to add wallet funds: " + (err.message || "Internal server error")
      });
    }
  };

  getWalletHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        throw new ApiError(HttpStatus.NOT_FOUND, MSG_USER_NOT_FOUND);
      }

      let transactions = await WalletTransactionModel.find({
        $or: [
          { userId: user._id },
          { userId: String(userId) }
        ]
      })
        .sort({ createdAt: -1 })
        .lean();

      // If user has existing wallet balance but no logged history yet, create initial credit log for existing balance
      if (transactions.length === 0 && (user.walletBalance || 0) > 0) {
        const initialTx = await WalletTransactionModel.create({
          userId: user._id,
          type: "credit",
          amount: user.walletBalance,
          description: "Funds Added to Wallet (Credit)",
          balanceAfter: user.walletBalance,
        });
        transactions = [initialTx.toObject() as any];
      }

      res.status(HttpStatus.OK).json({
        success: true,
        transactions
      });
    } catch (err: any) {
      console.error("DEBUG getWalletHistory error:", err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch wallet transaction history: " + (err.message || "Internal server error")
      });
    }
  };

  migrateOrderNumbers = async (req: Request, res: Response): Promise<void> => {
    try {
      // Fetch all orders sorted by creation date (oldest first)
      const orders = await OrderModel.find({}).sort({ createdAt: 1 }).lean();
      let migrated = 0;
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i] as any;
        if (!order.orderNumber) {
          await OrderModel.updateOne(
            { _id: order._id },
            { $set: { orderNumber: String(i + 1) } }
          );
          migrated++;
        }
      }
      res.status(HttpStatus.OK).json({
        success: true,
        message: `Migration complete. Assigned order numbers to ${migrated} orders.`,
        total: orders.length,
        migrated
      });
    } catch (err: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Migration failed: " + (err.message || "Internal server error")
      });
    }
  };
}

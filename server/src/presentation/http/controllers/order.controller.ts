import type { Request, Response } from "express";
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
    // @ts-ignore
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
    // @ts-ignore
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
    // @ts-ignore
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
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }

    const orders = await this._getUserOrdersUseCase.execute(userId);
    res.status(HttpStatus.OK).json(orders);
  };

  getMerchantSalesHistory = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const merchantId = req.user?.id;
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
    // @ts-ignore
    const merchantId = req.user?.id;
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
    // @ts-ignore
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
}

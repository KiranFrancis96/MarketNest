import type { Request, Response } from "express";
import type {
  IRegisterDeviceUseCase,
  IGetNotificationsUseCase,
  IGetUnreadNotificationsUseCase,
  IMarkNotificationAsReadUseCase,
  IDeleteNotificationUseCase,
  IGetNotificationPreferencesUseCase,
  IUpdateNotificationPreferencesUseCase,
} from "@/application/IUseCases/notification/INotificationUseCases.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_UNAUTHORIZED,
  MSG_DEVICE_REGISTERED_SUCCESS,
  MSG_NOTIFICATION_ID_REQUIRED,
  MSG_NOTIFICATION_MARKED_READ,
  MSG_NOTIFICATION_DELETED_SUCCESS,
  MSG_PREFERENCES_UPDATED_SUCCESS,
} from "@/presentation/http/controllers/messages.constants.ts";

export class NotificationController {
  constructor(
    private _registerDeviceUseCase: IRegisterDeviceUseCase,
    private _getNotificationsUseCase: IGetNotificationsUseCase,
    private _getUnreadNotificationsUseCase: IGetUnreadNotificationsUseCase,
    private _markAsReadUseCase: IMarkNotificationAsReadUseCase,
    private _deleteUseCase: IDeleteNotificationUseCase,
    private _getPreferencesUseCase: IGetNotificationPreferencesUseCase,
    private _updatePreferencesUseCase: IUpdateNotificationPreferencesUseCase
  ) {}

  registerDevice = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }

    const { deviceToken, browser, platform } = req.body;
    await this._registerDeviceUseCase.execute(userId, { deviceToken, browser, platform });
    
    res.status(HttpStatus.OK).json({ message: MSG_DEVICE_REGISTERED_SUCCESS });
  };

  getNotifications = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }

    const list = await this._getNotificationsUseCase.execute(userId);
    res.status(HttpStatus.OK).json(list);
  };

  getUnreadNotifications = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }

    const list = await this._getUnreadNotificationsUseCase.execute(userId);
    res.status(HttpStatus.OK).json(list);
  };

  markAsRead = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }
    if (!id) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_NOTIFICATION_ID_REQUIRED);
    }

    const notification = await this._markAsReadUseCase.execute(userId, id);
    res.status(HttpStatus.OK).json({ message: MSG_NOTIFICATION_MARKED_READ, notification });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }
    if (!id) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_NOTIFICATION_ID_REQUIRED);
    }

    await this._deleteUseCase.execute(userId, id);
    res.status(HttpStatus.OK).json({ message: MSG_NOTIFICATION_DELETED_SUCCESS });
  };

  getPreferences = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }

    const preferences = await this._getPreferencesUseCase.execute(userId);
    res.status(HttpStatus.OK).json(preferences);
  };

  updatePreferences = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);
    }

    const preferences = await this._updatePreferencesUseCase.execute(userId, req.body);
    res.status(HttpStatus.OK).json({ message: MSG_PREFERENCES_UPDATED_SUCCESS, preferences });
  };
}

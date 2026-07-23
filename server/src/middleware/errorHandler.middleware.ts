import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.ts";
import logger from "../utils/logger.ts";



import { MulterError } from "multer";

import { Error as MongooseError } from "mongoose";

import { ZodError } from "zod";

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {


    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            message: err.message,
        });
        return;
    }


    if (err instanceof MulterError) {
        res.status(400).json({
            message: err.message,
        });
        return;
    }


    if (err instanceof MongooseError.ValidationError) {
        res.status(400).json({
            message: err.message,
        });
        return;
    }


    if (err instanceof MongooseError.CastError) {
        res.status(400).json({
            message: `Invalid value for '${err.path}'.`,
        });
        return;
    }


    if (err instanceof ZodError) {
        res.status(400).json({
            message: "Validation failed.",
            errors: err.issues,
        });
        return;
    }

    logger.error(err, "Unhandled API error");

    res.status(500).json({
        message: "Internal server error.",
    });
};
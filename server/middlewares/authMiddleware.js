import { clerkClient } from "@clerk/express"
import AppError from "../utils/AppError.js"

// Require an authenticated Clerk user
export const protectAuth = async(req, res, next) => {
    try {
        const userId = req.auth?.userId

        if (!userId) {
            throw new AppError(
                "Authentication required",
                401,
                "AUTHENTICATION_REQUIRED"
            );
        }

        next();

    } catch (error) {
        next(error);
    }
};

// Require an authenticated educator
export const protectEducator = async(req, res, next) => {
    try {
        const userId = req.auth?.userId

        if (!userId) {
            throw new AppError(
                "Authentication required",
                401,
                "AUTHENTICATION_REQUIRED"
            );
        }
        const user = await clerkClient.users.getUser(userId);

        if (user.publicMetadata?.role !== "educator") {
            throw new AppError(
                "Educator access required",
                403,
                "EDUCATOR_ACCESS_REQUIRED"
            );
        }

        next();

    } catch (error) {
        next(error);
    }
};
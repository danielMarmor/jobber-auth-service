import { changePassword, forgotPassword, resetPassword } from "@auth/controllers/password";
import { read, resendEmail } from "@auth/controllers/current-user";
import { create } from "@auth/controllers/signup";
import { update } from "@auth/controllers/verify-email";
import express, { Application, Router } from "express";
import { token } from "@auth/controllers/refresh-token";
import { health } from "@auth/controllers/health";
import { seed } from "@auth/controllers/seeds";

const router: Router = express.Router();

export const seedRoutes = (app: Application) => {
    router.put('/seed/:count', seed);
    return router;
}
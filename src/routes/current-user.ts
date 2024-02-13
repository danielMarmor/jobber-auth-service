import { changePassword, forgotPassword, resetPassword } from "@auth/controllers/password";
import { read, resendEmail } from "@auth/controllers/current-user";
import { create } from "@auth/controllers/signup";
import { update } from "@auth/controllers/verify-email";
import express, { Application, Router } from "express";
import { token } from "@auth/controllers/refresh-token";

const router: Router = express.Router();

export const currentUserRoutes = (app: Application) => {
    router.get('/current-user', read);
    router.post('/resend-email', resendEmail);
    router.post('/refresh-token/:username', token);

    return router;
}
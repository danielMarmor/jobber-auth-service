import { changePassword, forgotPassword, resetPassword } from "@auth/controllers/password";
import { read, resendEmail } from "@auth/controllers/current-user";
import { create } from "@auth/controllers/signup";
import { update } from "@auth/controllers/verify-email";
import express, { Application, Router } from "express";
import { token } from "@auth/controllers/refresh-token";
import { health } from "@auth/controllers/health";
import { gigs, singleGig } from "@auth/controllers/gigs";

const router: Router = express.Router();

export const searchRoutes = (app: Application) => {
    router.get('/search/gig/:from/:size/:type', gigs);
    router.get('/search/gig/:gigId', singleGig);
    return router;
}
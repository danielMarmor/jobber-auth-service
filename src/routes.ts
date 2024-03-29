import { verifyGatewayRequest } from "@danielmarmor/jobber-shared";
import { Application } from "express";
import { authRoutes } from "@auth/routes/auth";
import { currentUserRoutes } from "@auth/routes/current-user";
import { healthRoutes } from "@auth/routes/health";
import { searchRoutes } from "./routes/search";
import { seedRoutes } from "./routes/seed";

const BASE_PATH = "/api/v1/auth";

export const appRoutes = (app: Application) => {
    app.use('', healthRoutes(app));
    app.use(BASE_PATH, verifyGatewayRequest, authRoutes(app));
    app.use(BASE_PATH, verifyGatewayRequest, currentUserRoutes(app));
    app.use(BASE_PATH, searchRoutes(app));
    app.use(BASE_PATH, seedRoutes(app));
}
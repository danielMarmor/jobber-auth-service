import express, { Express } from "express";
import { start } from "./server";
import { databaseConnection } from "./database";
import { config } from "./config";

const initialize = (): void => {
    config.cloudinaryConfig();
    const app: Express = express();
    databaseConnection();
    start(app);
}

initialize();
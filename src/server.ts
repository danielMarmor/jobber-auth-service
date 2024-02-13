import { CustomError, IAuthPayload, IErrorResponse, winstonLogger } from "@danielmarmor/jobber-shared";
import { Application, NextFunction, Request, Response, json, urlencoded } from "express";
import { Logger } from "winston";
import { config } from "@auth/config";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import { verify } from "jsonwebtoken";
import compression from "compression";
import { checkConnection } from "@auth/elasticsearch";
import http from 'http'
import { appRoutes } from "@auth/routes";
import { Channel } from "amqplib";
import { createConnection } from "./queues/connection";

const SERVICE_PORT = 4002;

const logger: Logger = winstonLogger(config.ELASTIC_SEARCH_URL!, "auth server", "debug");

export let authChannel : Channel | undefined;

export const start = async (app: Application): Promise<void> => {
    securityMiddleware(app);
    standartMiddlewear(app);
    authErrorMeddleware(app);
    routesMiddlewear(app);
    startQueues();
    startElasticSearch();
    startServer(app);
}

export const securityMiddleware = (app: Application): void => {
    app.set("trust proxy", 1);
    app.use(hpp());
    app.use(helmet());
    app.use(
        cors({
            origin: config.API_GATEWAY_URL,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        })
    );
    app.use((req: Request, _res: Response, next: NextFunction) => {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            const payload: IAuthPayload = verify(token, config.JWT_TOKEN!) as IAuthPayload;
            req.currentUser = payload;
        }
        next();
    });
}

const standartMiddlewear = (app: Application): void => {
    app.use(compression());
    app.use(json({ limit: '200mb' }));
    app.use(urlencoded({ extended: true, limit: '200mb' }));
}

const routesMiddlewear = (app: Application): void => {
    appRoutes(app);
}

const startQueues = async(): Promise<void> => {
    authChannel = await createConnection();
}

const startElasticSearch = () => {
    checkConnection();
}

const authErrorMeddleware = ((app: Application) => {
    app.use((error: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
        logger.log('error', `gatewy service error coming from ${error.comingFrom}`, error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json(error.serializeError())
        }
        next();
    })
});

const startServer = (app: Application) => {
    try {
        const server: http.Server = new http.Server(app);
        logger.info(`auth service has started with process id ${process.pid}`);
        server.listen(SERVICE_PORT, () => {
            logger.info(`auth service is listening on port ${SERVICE_PORT}`)
        })

    } catch (error) {
        logger.log('error', 'auth service startServer() method', error);
    }
}
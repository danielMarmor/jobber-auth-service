import { winstonLogger } from "@danielmarmor/jobber-shared";
import { Logger, log } from "winston";
import { config } from "@auth/config";
import { Sequelize } from "sequelize";

const logger: Logger = winstonLogger(config.ELASTIC_SEARCH_URL!, "authDataBaseServer", "debug");

export const sequelize = new Sequelize(
    config.MYSQL_DB!,
    {
        // dialect: 'mysql',
        // host: 'localhost',
        // username: 'jobber',
        // password: 'api',
        // database: 'jobber_auth',
        // pool: {
        //     max: 5,
        //     min: 0,
        //     acquire: 30000,
        //     idle: 10000,
        // },
        logging: false,
        dialectOptions: {
            multipleStatements: true
        }
    })

export const databaseConnection = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        logger.log('info', "Auth service - connected to database");
    } catch (error) {
        logger.error("Auth service - unable connect to database");
        logger.log('error', "authDataBaseServer databaseConnection() method", error);
    }
}
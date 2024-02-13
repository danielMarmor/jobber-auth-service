import { config } from "@auth/config";
import client, { Connection, Channel } from 'amqplib';
import { winstonLogger } from "@danielmarmor/jobber-shared";
import { Logger } from "winston";

const logger: Logger = winstonLogger(config.ELASTIC_SEARCH_URL!, "authServiceQueueConnection", "debug");

const createConnection = async (): Promise<Channel | undefined> => {
    try {
        const connection: Connection = await client.connect(`${config.RABBITMQ_ENDPOINT}`);
        const channel: Channel = await connection.createChannel();
        closeConnection(channel, connection);
        logger.info("authService connected to queue sucssesfully");
        return channel;
    }
    catch (error) {
        logger.log("error", "authService falied to connect to queue!", error);
        return undefined;
    }
}

const closeConnection = (channel: Channel, connection: Connection): void => {
    process.once("SIGINT", async () => {
        await channel.close();
        await connection.close();
    });
}

export { createConnection }
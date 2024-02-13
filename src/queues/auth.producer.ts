import { config } from "@auth/config";
import { winstonLogger } from "@danielmarmor/jobber-shared";
import { Channel } from "amqplib";
import { Logger } from "winston";
import { createConnection } from "./connection";

const logger: Logger = winstonLogger(config.ELASTIC_SEARCH_URL!, "authServiceQueueConnection", "debug");

export const publishDirectMessage = async (channel: Channel | undefined,
    exchangeName: string,
    routingKey: string,
    message: string,
    logMessage: string
): Promise<void> => {
    try {
        if (!channel) {
            channel = await createConnection();
        }
        await channel?.assertExchange(exchangeName, "direct");
        channel?.publish(exchangeName, routingKey, Buffer.from(message));
        logger.info(logMessage);
    }
    catch (error) {
        logger.log('error', "autht service on publishDirectMessage() method ", error)
    }

}
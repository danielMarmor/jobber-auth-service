import { winstonLogger } from "@danielmarmor/jobber-shared";
import { Client } from "@elastic/elasticsearch";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";
import { config } from "@auth/config";
import { Logger } from "winston";

const logger: Logger = winstonLogger(config.ELASTIC_SEARCH_URL!, "auth service elasticsearch server", "debug");

//let isSettings = false;

const node = config.ELASTIC_SEARCH_URL;
const elasticeSearchClient = new Client({
    node: node
});

export const checkConnection = async (): Promise<void> => {
    console.log('checkConnection');
    let isConnected = false;
    while (!isConnected) {
        try {
            const health: ClusterHealthResponse = await elasticeSearchClient.cluster.health();
            logger.info(`auth service elasticsearch status is ${health.status}`);
            isConnected = true;
        }
        catch (error) {
            logger.error("connection to Elasticsearch failed. Retrying...");
            logger.error("auth service checkConnection method()", error);
        }
    }
}

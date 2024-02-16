import { ISellerGig, winstonLogger } from "@danielmarmor/jobber-shared";
import { Client } from "@elastic/elasticsearch";
import { ClusterHealthResponse, GetResponse } from "@elastic/elasticsearch/lib/api/types";
import { config } from "@auth/config";
import { Logger } from "winston";
import { response } from "express";

const logger: Logger = winstonLogger(config.ELASTIC_SEARCH_URL!, "auth service elasticsearch server", "debug");

//let isSettings = false;

const node = config.ELASTIC_SEARCH_URL;
const elasticeSearchClient = new Client({
    node: node
});

const checkConnection = async (): Promise<void> => {
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

const checkIfIndexExists = async (indexName: string): Promise<boolean> => {
    const result = await elasticeSearchClient.indices.exists({ index: indexName });
    return result;
}

const createIndex = async (indexName: string): Promise<void> => {
    try {
        const isExists = await checkIfIndexExists(indexName);
        if (isExists) {
            logger.log("info", `index ${indexName} already exists`)
        }
        else {
            await elasticeSearchClient.indices.create({ index: indexName });
            await elasticeSearchClient.indices.refresh({ index: indexName });

            logger.log("info", `index ${indexName} created succesfully`)
        }
    } catch (error) {
        logger.error("createIndex in  Elasticsearch failed");
        logger.error("auth service createIndex method()", error);
    }
}


const getDocumentById = async (indexName: string, gigId: string): Promise<ISellerGig | undefined> => {
    try {
        const repsonse: GetResponse = await elasticeSearchClient.get({ index: indexName, id: gigId });
        return repsonse._source as ISellerGig;
    } catch (error) {
        logger.error("auth service getDocumentById method()", error);
    }
}


export { elasticeSearchClient, checkConnection, createIndex, getDocumentById }

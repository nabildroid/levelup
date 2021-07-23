import { PubSub } from "@google-cloud/pubsub";
import { NotionDb } from "../types/notion";
import envirement from "../utils/envirement";

export interface IPubSubConnector {
    publishNewContent: (db: NotionDb) => void,
}

export default class PubSubConnector implements IPubSubConnector {
    private client: PubSub;

    readonly PubsubTopics = {
        NOTION_NEW_CONTENT: envirement("devTopic", "prodTopic"),
    }

    constructor(client: PubSub) {
        this.client = client;
    }

    publishNewContent(db: NotionDb) {
        this.client.topic(this.PubsubTopics.NOTION_NEW_CONTENT).publishJSON(
            db
        );
    }
}
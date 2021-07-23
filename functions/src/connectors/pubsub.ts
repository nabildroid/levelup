import { PubSub, Topic } from "@google-cloud/pubsub";
import { json } from "express";
import { NotionDb } from "../types/notion";
import isDev from "../utils/isDev";
import envirement from "../utils/isDev";


export default class PubSubConnector {
    private client: PubSub;

    static createTopicName(name: string) {
        const projectId = process.env.PROJECT_ID || "";
        return `projects/${projectId}/topics/${name}`;
    }

    readonly pubsubTopics = {
        NOTION_NEW_CONTENT: PubSubConnector.createTopicName("notionHasUpdated")
    }

    constructor(client: PubSub) {
        this.client = client;

        if (isDev()) {
            Object.values(this.pubsubTopics).forEach(async name => {
                const topics = await this.client.getTopics();
                if (!topics[0].some(t => t.name == name)) {
                    this.client.createTopic(name);
                }
            });
        }
    }

    publishNotionUpdate(db: NotionDb) {
        console.log("[PUBSUB] publishing new sign of change " + db.id);

        return this.client.topic(this.pubsubTopics.NOTION_NEW_CONTENT).publishJSON(
            db
        );

    }
}
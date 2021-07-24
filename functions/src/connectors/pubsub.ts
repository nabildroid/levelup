import { PubSub, Topic } from "@google-cloud/pubsub";
import { json } from "express";
import { PubsubNewUpdateSource,PubsubPublishUpdateAttribute } from "../types/general";
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

    publishNotionUpdate(task: Task) {
        console.log("[PUBSUB] publishing new sign of change " + task.id);

    
        this.publishUpdate(task,PubsubNewUpdateSource.Notion);    
    }

    publishUpdate(task:Task,source: PubsubNewUpdateSource){
        const attribute:PubsubPublishUpdateAttribute = {
            from:source
        };

        return this.client.topic(this.pubsubTopics.NOTION_NEW_CONTENT)
            .publishJSON(task,attribute);
    }
}
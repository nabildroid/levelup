import { PubSub, Topic } from "@google-cloud/pubsub";
import { PubsubNewUpdateSource, PubsubPublishUpdateAttribute } from "../types/general";
import { Task } from "../types/task";
import isDev from "../utils/isDev";


export default class PubSubConnector {
    private client: PubSub;

    static createTopicName(name: string) {
        const projectId = process.env.PROJECT_ID || "";
        return `projects/${projectId}/topics/${name}`;
    }

    static readonly pubsubTopics = {
        NOTION_NEW_CONTENT: PubSubConnector.createTopicName("notionHasUpdated")
    }

    constructor(client: PubSub) {
        this.client = client;

        if (isDev()) {
            Object.values(PubSubConnector.pubsubTopics).forEach(async name => {
                const exists = await this.client.topic(name).exists();
                if (!exists[0]) {
                    await this.client.createTopic(name);
                }
            });
        }
    }

    publishNotionUpdate(task: Task) {
        console.log("[PUBSUB] publishing new sign of change " + task.id);


        this.publishUpdate(task, PubsubNewUpdateSource.Notion);
    }

    // an alternative to webhook
    // https://www.notion.so/laknabil/FC-isTodoistUpdated-475aa250f1724f59ac1b98b9a66389df
    publishTodoistUpdate(task: Task) {
        console.log("[PUBSUB] publishing new sign of change " + task.id);


        this.publishUpdate(task, PubsubNewUpdateSource.Todoist);
    }

    publishUpdate(task: Task, source: PubsubNewUpdateSource) {
        const attribute: PubsubPublishUpdateAttribute = {
            from: source
        };

        return this.client.topic(
            PubSubConnector.pubsubTopics.NOTION_NEW_CONTENT
        ).publishJSON(task, attribute);
    }
}
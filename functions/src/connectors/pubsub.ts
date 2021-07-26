import { PubSub, Topic } from "@google-cloud/pubsub";
import { PubsubDetectedEventTypeAttributes, PubsubInsertedSource, PubsubInsertTaskAttributes, PubsubValidateTaskAttributes } from "../types/pubsub";
import { Task } from "../types/task";
import isDev from "../utils/isDev";


export default class PubSubConnector {
    private client: PubSub;

    static createTopicName(name: string) {
        const projectId = process.env.PROJECT_ID || "";
        return `${name}`;
    }

    static readonly pubsubTopics = {
        INSERT_TASK: PubSubConnector.createTopicName("insert_task"),
        DETECTED_TASK_EVENT: PubSubConnector.createTopicName("detected_task_event"),
        VALIDATE_TASK: PubSubConnector.createTopicName("validate_task"),

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

    notionInsertTask(task: Task) {
        console.log("[PUBSUB] publishing new sign of change " + task.id);


        this.insertTask(task, PubsubInsertedSource.Notion);
    }

    // an alternative to webhook
    // https://www.notion.so/laknabil/FC-isTodoistUpdated-475aa250f1724f59ac1b98b9a66389df
    todoistInsertTask(task: Task) {
        console.log("[PUBSUB] publishing new sign of change " + task.id);


        this.insertTask(task, PubsubInsertedSource.Todoist);
    }

    // todo use this function publicly insteam of todoistInsertTask ..
    private insertTask(task: Task, source: PubsubInsertedSource) {
        const attribute: PubsubInsertTaskAttributes = {
            source
        };

        return this.client.topic(
            PubSubConnector.pubsubTopics.INSERT_TASK
        ).publishJSON(task, attribute);
    }


    validateTask(task: Task, source: PubsubInsertedSource) {
        this.log("validating "+task.id);
        const attribute: PubsubValidateTaskAttributes = {
            source
        }

        return this.client.topic(
            PubSubConnector.pubsubTopics.VALIDATE_TASK
        ).publishJSON(task, attribute);
    }

    detectedEventType(task: Task, attribute: PubsubDetectedEventTypeAttributes) {
        this.log(attribute.type);
        return this.client.topic(
            PubSubConnector.pubsubTopics.DETECTED_TASK_EVENT
        ).publishJSON(task, attribute)
    }

    log(msg: string) {
        console.log(`[PUBSUB] ${msg}`);
    }
}
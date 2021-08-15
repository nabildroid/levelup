import { PubSub } from "@google-cloud/pubsub";
import { PubsubDetectedEventTypeAttributes, PubsubSources, PubsubInsertTaskAttributes, PubsubValidateTaskAttributes, PubsubDetectedEventTypeMessageType } from "../types/pubsub";
import { NTID, Task } from "../types/task";
import isDev from "../utils/isDev";


export default class PubSubConnector {
    private client: PubSub;

    static readonly pubsubTopics = {
        INSERT_TASK: "insert_task",
        DETECTED_TASK_EVENT: "detected_task_event",
        VALIDATE_TASK: "validate_task",
    }

    getTopic(name: keyof typeof PubSubConnector.pubsubTopics) {
        return this.client.topic(PubSubConnector.pubsubTopics[name]);
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

    
    // todo use this function publicly insteam of todoistInsertTask ..
    insertTask(task: Task, source: PubsubSources) {
        const attribute: PubsubInsertTaskAttributes = {
            source
        };

        return this.client.topic(
            PubSubConnector.pubsubTopics.INSERT_TASK
        ).publishJSON(task, attribute);
    }


    validateTask(taskId: NTID, source: PubsubSources) {
        this.log("validating " + taskId);
        const attribute: PubsubValidateTaskAttributes = {
            source
        }

        return this.client.topic(
            PubSubConnector.pubsubTopics.VALIDATE_TASK
        ).publishJSON({ id: taskId }, attribute);
    }

    detectedEventType<T extends PubsubDetectedEventTypeAttributes>(data: PubsubDetectedEventTypeMessageType[T["type"]], attribute: T) {
        this.log(attribute.type);
        return this.client.topic(
            PubSubConnector.pubsubTopics.DETECTED_TASK_EVENT
        ).publishJSON(data, attribute)
    }

    private log(msg: string) {
        console.log(`[PUBSUB] ${msg}`);
    }
}
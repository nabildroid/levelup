import * as functions from "firebase-functions";
import { pubsub } from "..";
import { firestore } from "..";
import PubSubConnector from "../connectors/pubsub";
import { PubsubInsertTaskAttributes } from "../types/pubsub";
import { Task } from "../types/task";

const { INSERT_TASK } = PubSubConnector.pubsubTopics;

console.log(INSERT_TASK);

export default functions.pubsub
    .topic(INSERT_TASK)
    .onPublish(async (message, context) => {
        const attribute = message.attributes as PubsubInsertTaskAttributes;
        const data = message.json as Task;

        const storedTask = await firestore.getStoredTask(data.id);

        if (!storedTask) {
            return publishNewTask(data, attribute);
        } else {
            const isTaskValide = !storedTask.completed && data.done;
            if (isTaskValide) {
                return pubsub.validateTask(storedTask.id, attribute.source);
            } else {
                const task = {
                    ...data,
                    id: storedTask.id
                };
                return publishUpdateTask(task, attribute);
            }
        }
    });

const publishNewTask = (task: Task, attributes: PubsubInsertTaskAttributes) => pubsub.detectedEventType(task, {
    source: attributes.source,
    type: "new"
})

const publishUpdateTask = (task: Task & { id: [string, string] }, attributes: PubsubInsertTaskAttributes) => pubsub.detectedEventType(task, {
    source: attributes.source,
    type: "update"
})



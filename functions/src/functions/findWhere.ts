import * as functions from "firebase-functions";
import { pubsub } from "..";
import {firestore} from "..";
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
            pubsub.detectedEventType(data, {
                source: attribute.source,
                type: "new"
            })
        } else {
            if (storedTask.completed && !data.done) {
                pubsub.validateTask(data, attribute.source);

            } else {
                pubsub.detectedEventType(data, {
                    source: attribute.source,
                    type: "update"
                })
            }
        }
    });





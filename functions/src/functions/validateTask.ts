import * as functions from "firebase-functions";
import { pubsub } from "..";
import PubSubConnector from "../connectors/pubsub";
import { PubsubInsertTaskAttributes, PubsubValidateTaskAttributes } from "../types/pubsub";
import { NTID } from "../types/task";

const { VALIDATE_TASK } = PubSubConnector.pubsubTopics;


export default functions.pubsub
    .topic(VALIDATE_TASK)
    .onPublish(async (message, context) => {
        const attribute = message.attributes as PubsubValidateTaskAttributes;
        const { id } = message.json as { id: NTID }

        const isValide = await stillRemainingPomodoros(id);

        if (isValide) {
            pubsub.detectedEventType(id, {
                source: attribute.source,
                type: "complete"
            })
        } else {
            pubsub.detectedEventType(id, {
                source: attribute.source,
                type: "uncomplete"
            })
        }
    });


const stillRemainingPomodoros = (id: NTID): Promise<boolean> => {
    return Promise.resolve(Math.random() > .5);
}
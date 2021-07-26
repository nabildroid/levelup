import * as functions from "firebase-functions";
import { firestore, pubsub } from "..";
import PubSubConnector from "../connectors/pubsub";
import { PubsubInsertTaskAttributes } from "../types/pubsub";
import { NTID, StoredTask, Task } from "../types/task";

const { INSERT_TASK } = PubSubConnector.pubsubTopics;

console.log(INSERT_TASK);

export default functions.pubsub
    .topic(INSERT_TASK)
    .onPublish(async (message, context) => {
        const attribute = message.attributes as PubsubInsertTaskAttributes;
        const data = message.json as Task;

        const storedTask = await getStoredTask(data.id);

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





const getStoredTask = async (id: NTID): Promise<StoredTask | undefined> => {
    const ref = firestore.collection("/tasks")
        .where("id", "array-contains-any", id).limit(1);
    const query = await ref.get();

    return query.docs[0]?.data() as StoredTask;
}
import * as functions from "firebase-functions";
import { Message } from "firebase-functions/lib/providers/pubsub";
import { firestore } from "..";
import PubSubConnector from "../connectors/pubsub";
import { PubsubPublishUpdateAttribute } from "../types/general";
import { Task } from "../types/task";



const NOTION_NEW_CONTENT = PubSubConnector.pubsubTopics.NOTION_NEW_CONTENT;

export default functions.pubsub.topic(NOTION_NEW_CONTENT)
    .onPublish((message, context) => {
        const attribute = message.attributes as PubsubPublishUpdateAttribute;
        const data = message.json() as Task;


    });


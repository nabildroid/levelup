import * as admin from "firebase-admin";
import { PubSub } from "@google-cloud/pubsub";
import PubSubConnector from "./connectors/pubsub";
import dotenv from "dotenv";
import FirestoreConnector from "./connectors/firestore";

dotenv.config();
admin.initializeApp();
export const firestore = new FirestoreConnector(() => admin.firestore());

export const pubsub = new PubSubConnector(new PubSub());

export { default as isNotionUpdated } from "./functions/isNotionUpdated";
export { default as todoistWebhook } from "./functions/todoistWebhook";
export { default as findWhere } from "./functions/findWhere";
export { default as validateTask } from "./functions/validateTask";


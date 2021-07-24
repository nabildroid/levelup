import * as admin from "firebase-admin";
import mockDataFirestore from "./utils/mockDataFirestore";
import { PubSub } from "@google-cloud/pubsub";
import PubSubConnector from "./connectors/pubsub";
import isDev from "./utils/isDev";
import dotenv from "dotenv";


dotenv.config();

admin.initializeApp();
export const firestore = admin.firestore();

export const pubsub = new PubSubConnector(
    new PubSub()
);

if (isDev()) {
    mockDataFirestore(firestore);
}


export { default as isNotionUpdated } from "./functions/isNotionUpdated";

import * as admin from "firebase-admin";
import envirement from "./utils/envirement";
import mockDataFirestore from "./utils/mockDataFirestore";
import { PubSub } from "@google-cloud/pubsub";
import PubSubConnector, { IPubSubConnector } from "./connectors/pubsub";

admin.initializeApp();
export const firestore = admin.firestore();

export const pubsub: IPubSubConnector = new PubSubConnector(
    new PubSub()
);

if (envirement("dev", "") == "dev") {
    mockDataFirestore(firestore);
}


export { default as isNotionUpdated } from "./functions/isNotionUpdated";


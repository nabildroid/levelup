import * as admin from "firebase-admin";
import FirestoreConnector from "../src/connectors/firestore";

const projectId = "testfirebaseemulators"

process.env.GCLOUD_PROJECT = projectId;
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';



admin.initializeApp({
    projectId
})


export const firestore = new FirestoreConnector(
    admin.firestore()
);

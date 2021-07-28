import * as admin from "firebase-admin";
import dotenv from "dotenv";
import FirestoreConnector from "../src/connectors/firestore";

dotenv.config();

const projectId = "testfirebaseemulators"

process.env.GCLOUD_PROJECT = projectId;
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

export const NOTION_TOKEN = process.env.NOTION_TOKEN as string;

admin.initializeApp({
    projectId
})


export const firestore = new FirestoreConnector(
    admin.firestore()
);

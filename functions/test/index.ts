import * as admin from "firebase-admin";
import dotenv from "dotenv";
import FirestoreConnector from "../src/connectors/firestore";
import PubsubSubscriber from "../src/utils/pubsubSubscriber";
import PubSubConnector from "../src/connectors/pubsub";
import { PubSub } from "@google-cloud/pubsub";

dotenv.config();

const projectId = "levelup-automation"

process.env.GCLOUD_PROJECT = projectId;
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.PUBSUB_EMULATOR_HOST = 'localhost:8085'
export const NOTION_TOKEN = process.env.NOTION_TOKEN as string;

admin.initializeApp({
    projectId
})


export const firestore = new FirestoreConnector(
    admin.firestore()
);


export const pubscriber = new PubsubSubscriber(
    new PubSubConnector(
        new PubSub({
            projectId
        })
    )
)
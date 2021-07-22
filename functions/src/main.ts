import { PubsubTopics } from "./types/general";
import * as functions from "firebase-functions";
import {PubSub} from "@google-cloud/pubsub"
console.log(PubsubTopics.NOTION_NEW_CONTENT);

export const hello_world = functions.pubsub.topic("test").onPublish(()=>{
    console.log("subscriber");
    return Promise.resolve("sss");
})


const bus =new PubSub();

export const httpRequest = functions.https.onRequest(async (req,res) =>{
    await bus.topic("test").publish(Buffer.from("hello world"));

    res.send("done");
});

export interface IHELLO_WORLD {
    isOdd: (a: number) => boolean
}

export  class HelloWorld implements IHELLO_WORLD {

    isOdd(a: number) {
        return a % 2 != 0;
    }

}
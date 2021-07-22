import { PubsubTopics } from "./types/general";
import * as functions from "firebase-functions";

console.log(PubsubTopics.NOTION_NEW_CONTENT);

export const hello_world = functions.https.onRequest((req,res)=>{

    res.send("hello world");

});

// functions.pubsub.topic(PubsubTopics.NOTION_NEW_CONTENT).onPublish()

export interface IHELLO_WORLD {
    isOdd: (a: number) => boolean
}

export  class HelloWorld implements IHELLO_WORLD {

    isOdd(a: number) {
        return a % 2 != 0;
    }

}
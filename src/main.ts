import { PubsubTopics } from "./types/general";

console.log(PubsubTopics.NOTION_NEW_CONTENT);

export interface IHELLO_WORLD {
    isOdd: (a: number) => boolean
}

export  class HelloWorld implements IHELLO_WORLD {

    isOdd(a: number) {
        return a % 2 != 0;
    }

}
import axios from "axios";
import { firestore, NOTION_TOKEN, pubscriber } from ".";
import Notion from "../src/connectors/notion";
import { NotionDbType } from "../src/types/notion";
import { PubsubInsertTaskAttributes } from "../src/types/pubsub";
import { Task } from "../src/types/task";
import { User } from "../src/types/user";


const notion = new Notion(NOTION_TOKEN);



const projectId = process.env.GCLOUD_PROJECT
const path = (name: string, args: string = "") => `http://localhost:5001/${projectId}/us-central1/${name}${args}`;



afterAll(async()=>{
    await pubscriber.clear();
})


describe("test if isNotionUpdated sends pubsub events", () => {
    beforeEach(async () => {
        await firestore.clear();
        await firestore.createUser({
            auth: {
                notion: process.env.NOTION_TOKEN as string,
                todoist: "todoistAuth",
            },
            notionDB: [{
                id: "e7524bb3b85c48bab8e7a8cf10b81ea8",
                type: NotionDbType.TASK,
                lastRecentDate: new Date(Date.now() - 100000000000)
            }],
            todoistLabel: {},
            todoistProjects: []
        })
    });

    it("returns 200 status", async () => {

        const response = await axios.get(path("isNotionUpdated", "?user=nabil"));
        expect(response.status).toBe(200);
    });



    it("doesn't emit a new Update to Pubsub when User is up-todate", async () => {
        const userData = {
            auth: {
                notion: NOTION_TOKEN,
                todoist: "todoistAuth",
            },
            notionDB: [{
                id: "e7524bb3b85c48bab8e7a8cf10b81ea8",
                type: NotionDbType.TASK,
                lastRecentDate: new Date()
            }],
            todoistLabel: {},
            todoistProjects: []
        } as User;


        await firestore.createUser(userData);
        axios.get(path("isNotionUpdated", "?user=nabil"));


        await expect(pubscriber.isNotionUpdated()).rejects.toBeTruthy();
    })

    it("emits new Updated to Pubsub", async () => {

        await notion.createTask({
            parent: "e7524bb3b85c48bab8e7a8cf10b81ea8",
            id: "dsds",
            done: false,
            labels: [],
            title: "hello world"
        });

        axios.get(path("isNotionUpdated", "?user=nabil"));

        const event = await pubscriber.isNotionUpdated();

        expect(event).not.toBeNull();

        const attributes = event.attributes as PubsubInsertTaskAttributes;

        expect(attributes.source).toEqual("notion");

        const data = JSON.parse(Buffer.from(event.data).toString()) as Task;

        expect(data).toHaveProperty("done");
        expect(data).toHaveProperty("title");
        expect(data.id).toHaveLength(1)
        expect(data.parent).toHaveLength(1)

    })



});
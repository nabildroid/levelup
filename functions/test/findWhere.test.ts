import axios from "axios";
import { firestore, NOTION_TOKEN, pubscriber } from ".";
import Notion from "../src/connectors/notion";
import { NotionDbType } from "../src/types/notion";
import { PubsubDetectedEventTypeAttributes } from "../src/types/pubsub";
import { NTID, Task } from "../src/types/task";
import { User } from "../src/types/user";
import { fromNow, getEventByID } from "./utils";


const notion = new Notion(NOTION_TOKEN);



const projectId = process.env.GCLOUD_PROJECT
const path = (name: string, args: string = "") => `http://localhost:5001/${projectId}/us-central1/${name}${args}`;





describe("test findwhere, a event type detector", () => {


    it("doesn't fire when User is uptodate", async () => {
        const userData = {
            auth: {
                notion: NOTION_TOKEN,
                todoist: "todoistAuth",
            },
            notionDB: [{
                id: "a29912913c7a4357a43938f0f6f0ccf5",
                type: NotionDbType.TASK,
                lastRecentDate: fromNow()
            }],
            todoistLabel: {},
            todoistProjects: []
        } as User;

        await firestore.createUser(userData);

        axios.get(path("isNotionUpdated", "?user=nabil"))

        await expect(pubscriber.findWhere()).rejects.toBeTruthy();
    })


    const task = {
        id: "dssdsdsd",
        done: false,
        parent: "a29912913c7a4357a43938f0f6f0ccf5",
        labels: [],
        title: "dsdsd",
    };

    it("detects new tasks", async () => {

        const userData = {
            auth: {
                notion: NOTION_TOKEN,
                todoist: "todoistAuth",
            },
            notionDB: [{
                id: "a29912913c7a4357a43938f0f6f0ccf5",
                type: NotionDbType.TASK,
                lastRecentDate: fromNow(-1),
            }],
            todoistLabel: {},
            todoistProjects: []
        } as User;

        await firestore.createUser(userData);

        const page = await notion.createTask(task);

        axios.get(path("isNotionUpdated", "?user=nabil"))

        const events = await pubscriber.findWhere();
        const event = getEventByID(events, page.id);
        expect(event).toBeTruthy();

        const attributes = event.attributes as PubsubDetectedEventTypeAttributes;

        expect(attributes.type).toEqual("new");
        const data = JSON.parse(Buffer.from(event.data).toString()) as Task;

        expect(data.id).toHaveLength(1);
        expect(data.id).toEqual([page.id])
        expect.setState({ id: data.id });

    });



    it("detects updated tasks", async () => {


        const userData = {
            auth: {
                notion: NOTION_TOKEN,
                todoist: "todoistAuth",
            },
            notionDB: [{
                id: "a29912913c7a4357a43938f0f6f0ccf5",
                type: NotionDbType.TASK,
                lastRecentDate: fromNow(-1),
            }],
            todoistLabel: {},
            todoistProjects: []
        } as User;

        await firestore.createUser(userData);
        await firestore.saveNewTask(expect.getState().id as NTID, "nabil");

        axios.get(path("isNotionUpdated", "?user=nabil"))

        const events = await pubscriber.findWhere();
        const event = getEventByID(events, expect.getState().id[0]);
        expect(event).toBeTruthy();

        const attributes = event.attributes as PubsubDetectedEventTypeAttributes;

        expect(attributes.type).toEqual("update");
        const data = JSON.parse(Buffer.from(event.data).toString()) as Task;

        expect(data.id).toEqual(expect.getState().id)
        expect(data.title).toEqual(task.title);
        expect(data.parent).toEqual([task.parent]);
    });

    it("detects completed tasks", async () => {


        const userData = {
            auth: {
                notion: NOTION_TOKEN,
                todoist: "todoistAuth",
            },
            notionDB: [{
                id: "a29912913c7a4357a43938f0f6f0ccf5",
                type: NotionDbType.TASK,
                lastRecentDate: fromNow(-1),
            }],
            todoistLabel: {},
            todoistProjects: []
        } as User;

        await firestore.createUser(userData);
        await firestore.saveNewTask(expect.getState().id as NTID, "nabil");

        await notion.updateTask({
            ...task,
            done: true,
            id: expect.getState().id[0]
        })

        axios.get(path("isNotionUpdated", "?user=nabil"))

        const events = await pubscriber.findWhere();
        const event = getEventByID(events, expect.getState().id[0]);
        expect(event).toBeTruthy();

        const attributes = event.attributes as PubsubDetectedEventTypeAttributes;

        expect(attributes.type).toEqual("complete");
        const data = JSON.parse(Buffer.from(event.data).toString()) as NTID;

        expect(data).toEqual(expect.getState().id)

    });

});
import axios from "axios";
import { firestore, NOTION_TOKEN, pubscriber, TODOIST_TOKEN } from "../";
import Notion from "../../src/connectors/notion";
import TodoistConnector from "../../src/connectors/todoist";
import { NotionDbType, NotionTaskCreate, NotionTaskUpdate } from "../../src/types/notion";
import { PubsubDetectedEventTypeAttributes } from "../../src/types/pubsub";
import { NTID, Priority, StoredTask, Task } from "../../src/types/task";
import { User } from "../../src/types/user";
import { extractNotionIdfromNTID } from "../../src/utils/notionUtils";
import { extractTodoistIdfromNTID } from "../../src/utils/todoistUtils";
import { fromNow, getEventByID, pause, randomTodoistID } from "../utils";

const projectId = process.env.GCLOUD_PROJECT
const path = (name: string, args: string = "") => `http://localhost:5001/${projectId}/us-central1/${name}${args}`;


beforeAll(async () => {
    await firestore.clear()
    await firestore.createUser({
        auth: {
            notion: NOTION_TOKEN,
            todoist: TODOIST_TOKEN,
        },
        notionDB: [
            {
                id: "34d4b5bdafc5493f9f4868a345c3e207",
                type: NotionDbType.TASK,
                lastRecentDate: fromNow(-10),
            },
            {
                id: "f4e7a42baac1486aae382c5a3384c726",
                type: NotionDbType.THOUGHT,
                lastRecentDate: fromNow(-10),
            },
        ],
        todoistLabel: {
            1522: "tech",
            88797: "life",
            81797: "learning",
        },
        // todo neither the Inbox nor NotionThoughts exists here !!!
        todoistProjects: [
            ["2271415580", "34d4b5bdafc5493f9f4868a345c3e207"],
            ["34d4b5bdafc5493f9f4868a345c3e207", "2271415580"],
        ],
    });
});

const notion = new Notion(NOTION_TOKEN);
const todoist = new TodoistConnector(TODOIST_TOKEN);

describe("E2E Notion to todoist flow", () => {
    it("creates new Task", async () => {
        const newTask: NotionTaskCreate = {
            title: Math.random().toString(),
            priority: Priority.P2,
            parent: "34d4b5bdafc5493f9f4868a345c3e207",
            done: false,
        }
        const detach = await pubscriber.attatchUpdateTodoist(path("updateTodoist"));
        await notion.createTask(newTask);
        await axios.get(path("isNotionUpdated", "?user=nabil"));
        await pause(10);
        await detach();
        const newTasks = await todoist.checkForNewTask(fromNow(-3).toDate());
        const targetTask = newTasks.find(t => t.content == newTask.title);
        expect(targetTask).toBeTruthy();
        const storedTask = await firestore.getStoredTask([targetTask?.id as string]) as StoredTask;
        expect.setState(storedTask);

    });
    it("updates a Task", async () => {
        const storedTask = expect.getState() as unknown as StoredTask;
        const notionID = extractNotionIdfromNTID(storedTask.id) as string;
        const todoistID = extractTodoistIdfromNTID(storedTask.id) as string;

        const updatedTask: NotionTaskUpdate = {
            title: Math.random().toString(),
            priority: Priority.P3,
            id: notionID
        }
        const detach = await pubscriber.attatchUpdateTodoist(path("updateTodoist"));
        await notion.updateTask(updatedTask);
        await axios.get(path("isNotionUpdated", "?user=nabil"));
        await pause(10);
        await detach();
        const newTasks = await todoist.checkForNewTask(fromNow(-3).toDate());
        const targetTask = newTasks.find(t => t.content == updatedTask.title);
        expect(targetTask).toBeTruthy();
        expect(targetTask?.id).toEqual(todoistID);

    });
    it("completes a Task",async ()=>{
        const storedTask = expect.getState() as unknown as StoredTask;
        const notionID = extractNotionIdfromNTID(storedTask.id) as string;
        const todoistID = extractTodoistIdfromNTID(storedTask.id) as string;

        const updatedTask: NotionTaskUpdate = {
            id: notionID,
            done:true,
        }

        const detach = await pubscriber.attatchUpdateTodoist(path("updateTodoist"));
        await notion.updateTask(updatedTask);
        await axios.get(path("isNotionUpdated", "?user=nabil"));
        await pause(10);
        await detach();
        const newTasks = await todoist.checkForNewTask(fromNow(-3).toDate());
        const targetTask = newTasks.find(t => t.id == todoistID);
        expect(targetTask).toBeFalsy();
    });
})
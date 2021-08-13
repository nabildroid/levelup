import axios from "axios";
import { firestore, NOTION_TOKEN, pubscriber, TODOIST_TOKEN } from "../";
import Notion from "../../src/connectors/notion";
import TodoistConnector from "../../src/connectors/todoist";
import { NotionDbType, NotionTaskCreate, NotionTaskUpdate } from "../../src/types/notion";
import { PubsubDetectedEventTypeAttributes } from "../../src/types/pubsub";
import { NTID, Priority, StoredTask, Task } from "../../src/types/task";
import { TodoistNewTask, TodoistTaskUpdate, TodoistWebhook, TodoistWebhookType } from "../../src/types/todoist";
import { User } from "../../src/types/user";
import { fromPriority } from "../../src/utils/general";
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

describe("E2E todoist to Notion flow", () => {
    it("creates new Task", async () => {
        const newTask: TodoistNewTask = {
            content: Math.random().toString(),
            priority: fromPriority(Priority.P2),
            project_id: "2271415580",
        }
        const detach = await pubscriber.attatchUpdateNotion(path("updateNotion"));
        const task = await todoist.createTask(newTask);
        console.log(task);
        await axios.post(path("todoistWebhook"), {
            event_name: TodoistWebhookType.NewTask,
            event_data: task,
            user_id: parseInt(randomTodoistID()),
        } as TodoistWebhook);

        await pause(10);
        await detach();

        const tasks = await notion.checkForNewTasks({
            id: "34d4b5bdafc5493f9f4868a345c3e207",
            type: NotionDbType.TASK,
            lastRecentDate: fromNow(-10),
        });

        const targetTask = tasks.find(t => t.title == newTask.content);
        expect(targetTask).toBeTruthy();

        const storedTask = await firestore.getStoredTask([targetTask?.id as string]) as StoredTask;
        expect.setState(storedTask);
    });

    it("updates a Task", async () => {
        const storedTask = expect.getState() as unknown as StoredTask;
        const notionID = extractNotionIdfromNTID(storedTask.id) as string;
        const todoistID = extractTodoistIdfromNTID(storedTask.id) as string;

        const updatedTask: TodoistTaskUpdate = {
            id:todoistID,
            content: Math.random().toString(),
            priority: fromPriority(Priority.P1),
        }
        const detach = await pubscriber.attatchUpdateNotion(path("updateNotion"));
        await todoist.updateTask(updatedTask);
        
        await axios.post(path("todoistWebhook"), {
            event_name: TodoistWebhookType.UpdatedTask,
            event_data: {
                ...updatedTask,
                checked:false,
                labels:[],
                project_id:"2271415580",
                section_id:0,
            },
            user_id: parseInt(randomTodoistID()),
        } as TodoistWebhook);

        await pause(10);
        await detach();

        const tasks = await notion.checkForNewTasks({
            id: "34d4b5bdafc5493f9f4868a345c3e207",
            type: NotionDbType.TASK,
            lastRecentDate: fromNow(-10),
        });

        const targetTask = tasks.find(t => t.title == updatedTask.content);
        expect(targetTask).toBeTruthy();
        expect(targetTask?.id).toEqual(notionID);
    });

    it("completes a Task",async ()=>{
        const storedTask = expect.getState() as unknown as StoredTask;
        const notionID = extractNotionIdfromNTID(storedTask.id) as string;
        const todoistID = extractTodoistIdfromNTID(storedTask.id) as string;

        const detach = await pubscriber.attatchUpdateNotion(path("updateNotion"));
        await todoist.closeTask(todoistID);
        
        await axios.post(path("todoistWebhook"), {
            event_name: TodoistWebhookType.CompletedTask,
            event_data: {
                id:todoistID,
                content:"dsdsdsdsd",
                priority:fromPriority(Priority.P2),
                checked:true,
                labels:[],
                project_id:"2271415580",
                section_id:0,
            },
            user_id: parseInt(randomTodoistID()),
        } as TodoistWebhook);

        await pause(10);
        await detach();

        const tasks = await notion.checkForNewTasks({
            id: "34d4b5bdafc5493f9f4868a345c3e207",
            type: NotionDbType.TASK,
            lastRecentDate: fromNow(-10),
        });

        const targetTask = tasks.find(t => t.id == notionID);
        expect(targetTask).toBeTruthy();
        expect(targetTask?.done).toBeTruthy();

    });
})
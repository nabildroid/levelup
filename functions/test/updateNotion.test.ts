import axios from "axios";
import {
    ensureNotionTaskIdExists,
    extractNotionIdfromNTID,
    newTask,
    updateTask,
} from "../src/utils/notionUtils";

import { translateTodoistLabels } from "../src/utils/todoistUtils";

import { NotionDbType } from "../src/types/notion";
import { User } from "../src/types/user";
import { firestore } from ".";
import Notion from "../src/connectors/notion";
import { fromNow } from "./utils";
import { NOTION_TOKEN } from ".";
import { Task } from "../src/types/task";
import { PubsubDetectedEventTypeAttributes, PubsubSources } from "../src/types/pubsub";
import { getFullNTID } from "../src/utils/general";

const notion = new Notion(NOTION_TOKEN);

const projectId = process.env.GCLOUD_PROJECT

const path = `http://localhost:5001/${projectId}/us-central1/updateNotion`;



const user: User = {
    auth: {
        notion: process.env.NOTION_TOKEN as string,
        todoist: "ededed",
    },
    notionDB: [
        {
            id: "fec204bf56ec4abd958654fe93222ec5",
            type: NotionDbType.TASK,
            lastRecentDate: new Date(),
        },
        {
            id: "fec204bf56ec4abd958654fe93222ec5",
            type: NotionDbType.TASK,
            lastRecentDate: new Date(),
        },
        {
            id: "a29912913c7a4357a43938f0f6f0ccdd",
            type: NotionDbType.THOUGHT,
            lastRecentDate: new Date(),
        },
    ],
    todoistLabel: {
        1522: "tech",
        88797: "life",
        81797: "learning",
    },
    todoistProjects: [
        ["poject1", "a29912913c7a4357a4938f0f6f0ccf5"],
        ["fec204bf56ec4abd958654fe93222ec5", "project2"],
        ["poject3"],
    ],
};

describe("notion should reflect the exact state of other services", () => {
    describe("helper functions", () => {
        it("extracts NotionID from NTID", () => {
            const notionID = "fec204bf56ec4abd958654fe93222ec5";
            expect(extractNotionIdfromNTID(["dded", notionID])).toEqual(
                notionID
            );

            expect(extractNotionIdfromNTID([notionID, "ssdsdsd"])).toEqual(
                notionID
            );
        });

        it("finds the second part of NTID", () => {
            const p1 = user.todoistProjects[0];
            const p2 = user.todoistProjects[1];
            const p3 = user.todoistProjects[2];
            expect(getFullNTID(user, [p1[0]])).toContainEqual(p1[1]);

            expect(getFullNTID(user, [p1[1] as string])).toContainEqual(p1[0]);

            expect(getFullNTID(user, [p2[1] as string])).toContainEqual(p2[0]);

            if (p3.length == 1) {
                // converts inbox to thought database
                expect(getFullNTID(user, [p3[0] as string])).toContainEqual(
                    user.notionDB.find((d) => d.type == NotionDbType.THOUGHT)
                        ?.id
                );
            }
        });

        it("translatse TodoistLabels IDs to strings", () => {
            const labels = user.todoistLabel;
            const labelStrings = Object.values(labels);
            const labelIds = Object.keys(labels);

            labelIds.forEach((l) => {
                expect(
                    translateTodoistLabels(user, labelStrings)
                ).toContainEqual(l);
            });

            labelStrings.forEach((l) => {
                expect(translateTodoistLabels(user, labelIds)).toContainEqual(
                    l
                );
            });
        });
    });

    describe("firebase related helper functions", () => {
        beforeAll(async () => {
            await firestore.clear();
        });
        it("ensures both Todoist & Notion IDs exists", async () => {
            const p1 = user.todoistProjects[0];

            await firestore.saveNewTask(p1, "nabil");

            expect(
                await ensureNotionTaskIdExists([p1[0]], firestore)
            ).toContainEqual(p1[1]);
            expect(
                await ensureNotionTaskIdExists([p1[1] as string], firestore)
            ).toContainEqual(p1[1]);
        });
    });

    describe("notion related helper functions", () => {
        it("creates new Task", async () => {
            const { id } = await newTask(
                {
                    done: false,
                    parent: ["fec204bf56ec4abd958654fe93222ec5"],
                    title: "hello world",
                    labels: ["test"],
                    id: [""],
                },
                user,
                notion
            );
            expect(id).toBeTruthy();
            expect.setState({ id });
        });

        it("updates a Task", async () => {
            const id = expect.getState().id as string;

            const randomTitle = Math.random().toString();

            expect(
                updateTask(
                    {
                        id: [id, "idsudus"],
                        title: randomTitle,
                    },
                    notion
                )
            ).resolves;

            const tasks = await notion.checkForNewTask({
                id: "fec204bf56ec4abd958654fe93222ec5",
                lastRecentDate: fromNow(-1),
                type: NotionDbType.TASK,
            });

            expect(tasks.length).toBeGreaterThanOrEqual(1);
            expect(tasks.some((t) => t.id == id)).toBeTruthy();
        });
    });

    describe("updateNotion service", () => {

        it("creates new Task",async () =>{
            await firestore.createUser(user);

            const randomTitle = Math.random().toString();

            await axios.post(path,{
                done:true,
                id:["TODOIST_ID"],
                parent:["project2"],
                labels:["81797"],
                title:randomTitle,
            } as Task,{
                headers:{
                    attributes:JSON.stringify({
                        source:PubsubSources.Todoist,
                        type:"new"
                    } as PubsubDetectedEventTypeAttributes)
                }
            })

            const tasks = await notion.checkForNewTask({
                id: "fec204bf56ec4abd958654fe93222ec5",
                lastRecentDate: fromNow(-1),
                type: NotionDbType.TASK,
            });

            const lastTask = tasks.find(t=>t.title == randomTitle);
            expect(lastTask).toBeTruthy();
            expect(lastTask?.labels).toContainEqual(user.todoistLabel[81797])
            expect.setState({id:lastTask?.id})

        });

        it("updates new Task",async ()=>{
            const randomTitle = Math.random().toString();

            await axios.post(path,{
                id:["TODOIST_ID"],
                labels:["1522","81797"],
                title:randomTitle,
            } as Task,{
                headers:{
                    attributes:JSON.stringify({
                        source:PubsubSources.Todoist,
                        type:"update"
                    } as PubsubDetectedEventTypeAttributes)
                }
            })

            const tasks = await notion.checkForNewTask({
                id: "fec204bf56ec4abd958654fe93222ec5",
                lastRecentDate: fromNow(-1),
                type: NotionDbType.TASK,
            });

            const lastTask = tasks.find(t=>t.title == randomTitle);
            expect(lastTask).toBeTruthy();
            expect(lastTask?.labels).toContainEqual(user.todoistLabel[1522])
            expect(lastTask?.done).toBeTruthy();
            expect(lastTask?.id).toEqual(expect.getState().id)
        });


        it.todo("complete a task");
        it.todo("incomplete a task");
    });
});

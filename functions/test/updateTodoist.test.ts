import axios from "axios";
import {
    ensureTodoistTaskIdExists,
    extractTodoistIdfromNTID,
    newTask,
    updateTask,
} from "../src/utils/todoistUtils";

import { translateTodoistLabels } from "../src/utils/todoistUtils";

import { User } from "../src/types/user";
import { firestore } from ".";
import TodoistConnector from "../src/connectors/todoist";

import { fromNow, pause } from "./utils";
import { TODOIST_TOKEN } from ".";
import { NewTask, Priority, Task, UpdateTask } from "../src/types/task";
import { PubsubDetectedEventTypeAttributes, PubsubSources } from "../src/types/pubsub";
import { getFullNTID } from "../src/utils/general";
import { NotionDbType } from "../src/types/notion";
import { randomNotionID } from "./utils";

const todoist = new TodoistConnector(TODOIST_TOKEN);

const projectId = process.env.GCLOUD_PROJECT

const path = `http://localhost:5001/${projectId}/us-central1/updateTodoist`;



const user: User = {
    auth: {
        notion: process.env.NOTION_TOKEN as string,
        todoist: TODOIST_TOKEN,
    },
    notionDB: [
        {
            id: "64559c948e28454082785ccb2bc6b6a5",
            type: NotionDbType.TASK,
            lastRecentDate: fromNow(),
        },
        {
            id: "589d99703060439ea3b6c2202ded5992",
            type: NotionDbType.THOUGHT,
            lastRecentDate: fromNow(),
        },
    ],
    todoistLabel: {
        1522: "tech",
        88797: "life",
        81797: "learning",
    },
    // todo neither the Inbox nor NotionThoughts exists here !!!
    todoistProjects: [
        ["2267007167", "64559c948e28454082785ccb2bc6b6a5"],
        ["64559c948e28454082785ccb2bc6b6a5", "2267007167"],
    ],
};


beforeAll(async () => {
    await firestore.clear();
})

describe("todoist should reflect the exact state of other services", () => {
    describe("helper functions", () => {
        it("extracts TodoistID from NTID", () => {
            const todoistID = "1524444";
            expect(extractTodoistIdfromNTID(["64559c948e28454082785ccb2bc6b6a5", todoistID])).toEqual(
                todoistID
            );

            expect(extractTodoistIdfromNTID([todoistID, "64559c948e28454082785ccb2bc6b6a5"])).toEqual(
                todoistID
            );
        });

        it("finds the second part of NTID", () => {
            const p1 = user.todoistProjects[0];
            expect(getFullNTID(user, [p1[1] as string])).toContainEqual(p1[1]);

            expect(getFullNTID(user, [])).toContainEqual(
                user.notionDB.find((d) => d.type == NotionDbType.THOUGHT)
                    ?.id
            );

            expect(getFullNTID(user, [])).toHaveLength(1);

        });

        it("translatse TodoistLabels Strings to IDs", () => {
            const labels = user.todoistLabel;
            const labelStrings = Object.values(labels);
            const labelIds = Object.keys(labels).map(l => parseInt(l));

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
            const p1 = user.todoistProjects[0] as [string, string];

            await firestore.saveNewTask(p1, "nabil");

            expect(
                await ensureTodoistTaskIdExists([p1[0]], firestore)
            ).toContainEqual(p1[0]);

            expect(
                await ensureTodoistTaskIdExists([p1[1] as string], firestore)
            ).toContainEqual(p1[0]);
        });
    });

    describe("todoist related helper functions", () => {
        it("creates new Task", async () => {
            const { id } = await newTask(
                {
                    parent: ["64559c948e28454082785ccb2bc6b6a5"],
                    id: [randomNotionID()],
                    title: "hello world",
                },
                user,
                todoist
            );
            expect(id).toBeTruthy();
            console.log(id);
            expect.setState({ id });
        });



        it("updates a Task", async () => {
            const id = expect.getState().id as string;
            console.log("/////////////////////////", id);
            const randomTitle = Math.random().toString();

            await expect(
                updateTask(
                    {
                        id: [id, "64559c948e28454082785ccb2bc6b6a5"],
                        title: randomTitle,
                        priority: Priority.P1,
                        labels: [],
                    },
                    todoist
                )
            ).resolves;
            await pause();
            const tasks = await todoist.checkForNewTask(fromNow().toDate());

            expect(tasks.length).toBeGreaterThanOrEqual(1);
            const task = tasks.find((t) => t.id == id);
            expect(task).toBeTruthy();
            expect(task?.content).toEqual(randomTitle);
        });

        it("creates new Thought / inbox", async () => {
            const { id } = await newTask(
                {
                    parent: ["589d99703060439ea3b6c2202ded5992"],
                    id: [randomNotionID()],
                    title: "hello world",
                    labels: [],
                },
                user,
                todoist
            );
            expect(id).toBeTruthy();
            console.log(id);
            expect.setState({ id });
        });
    });

    describe("updateNotion service", () => {
        beforeAll(async () => {
            await firestore.clear();
        })

        it("creates new Task", async () => {
            await firestore.createUser(user);

            const randomTitle = Math.random().toString();
            const newTask: NewTask = {
                id: ["64559c948e454082785ccb2bc6b6a5"],
                parent: ["64559c948e28454082785ccb2bc6b6a5"],
                title: randomTitle,
            };

            await axios.post(path, newTask, {
                headers: {
                    attributes: JSON.stringify({
                        source: PubsubSources.Notion,
                        type: "new"
                    } as PubsubDetectedEventTypeAttributes)
                }
            })

            const tasks = await todoist.checkForNewTask(fromNow(-1).toDate());

            const lastTask = tasks.find(t => t.content == randomTitle);
            expect(lastTask).toBeTruthy();
            expect.setState({ id: lastTask?.id })

        });

        it("updates new Task", async () => {
            const randomTitle = Math.random().toString();
            const updatedTask: UpdateTask = {
                id: [randomNotionID(), expect.getState().id.toString()],
                title: randomTitle,
            };

            await axios.post(path, updatedTask, {
                headers: {
                    attributes: JSON.stringify({
                        source: PubsubSources.Notion,
                        type: "update"
                    } as PubsubDetectedEventTypeAttributes)
                }
            })

            const tasks = await todoist.checkForNewTask(fromNow(-1).toDate());

            const lastTask = tasks.find(t => t.content == randomTitle);
            expect(lastTask).toBeTruthy();
            expect(lastTask?.id).toEqual(expect.getState().id)
        });


        it.todo("complete a task");
        it.todo("incomplete a task");
    });
});

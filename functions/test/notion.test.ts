import { NOTION_TOKEN } from ".";
import Notion from "../src/connectors/notion";
import { NotionDb, NotionDbType, NotionServerSingleTaskResponse, NotionTask, NotionTaskCreate, NotionTaskUpdate } from "../src/types/notion";
import { Priority } from "../src/types/task";
import { fromNow } from "./utils";
import {firestore} from "firebase-admin";

const notion = new Notion(NOTION_TOKEN);

describe("test NotionConnector & NotionAPI", () => {

    describe("format conventor", () => {
        const task: NotionTask = {
            done: Math.random() > .5,
            id: "ID1",
            labels: ["label1"],
            title: "hello world",
            priority: Priority.P3,
            section: "section1",
            parent: "parentID",
            last_edited: fromNow().toDate()
        };

        it("converts Task to accepted NotionAPI format", () => {

            const acceptedFormat = Notion.convertNotionTaskToSingleTaskPageProperties(task);

            expect(acceptedFormat).toHaveProperty("done");
            expect(acceptedFormat).toHaveProperty("labels");
            expect(acceptedFormat).toHaveProperty("priority");
            expect(acceptedFormat).toHaveProperty("section");
            expect(acceptedFormat).not.toHaveProperty("id");
            expect(acceptedFormat).not.toHaveProperty("parent");
            expect(acceptedFormat).not.toHaveProperty("last_edited");

        })

        it("converts Partial Task to accepted NotionAPI format", () => {
            const { done, priority, id, labels, title, section } = task
            let acceptedFormat = Notion.convertNotionTaskToSingleTaskPageProperties({
                done, priority
            });

            expect(acceptedFormat).toHaveProperty("done");
            expect(acceptedFormat).not.toHaveProperty("labels");
            expect(acceptedFormat).toHaveProperty("priority");
            expect(acceptedFormat).not.toHaveProperty("section");
            expect(acceptedFormat).not.toHaveProperty("id");
            expect(acceptedFormat).not.toHaveProperty("parent");
            expect(acceptedFormat).not.toHaveProperty("last_edited");
            expect(acceptedFormat).not.toHaveProperty("title");

            acceptedFormat = Notion.convertNotionTaskToSingleTaskPageProperties({
                title, labels, section
            });

            expect(acceptedFormat).toHaveProperty("title");
            expect(acceptedFormat).toHaveProperty("labels");
            expect(acceptedFormat).not.toHaveProperty("priority");
            expect(acceptedFormat).toHaveProperty("section");
            expect(acceptedFormat).not.toHaveProperty("id");
            expect(acceptedFormat).not.toHaveProperty("parent");
            expect(acceptedFormat).not.toHaveProperty("last_edited");
        })

        it("converts Notion API fromat to Task", () => {

            const notionAPIFormat = {
                properties: Notion.convertNotionTaskToSingleTaskPageProperties(task),
                id: task.id,

            } as NotionServerSingleTaskResponse;

            const taskFormat = Notion.convertSingleTaskPageResponseToNotionTask({
                ...notionAPIFormat,
                properties: {
                    ...notionAPIFormat.properties,
                    last_edited: {
                        id: "dsdzd",
                        type: "last_edited_time",
                        last_edited_time: fromNow().toDate().toISOString(),
                    }
                }
            }, task.parent);

            expect(taskFormat.done).toEqual(task.done);
            expect(taskFormat.id).toEqual(task.id);
            expect(taskFormat.labels).toEqual(task.labels);
            expect(taskFormat.parent).toEqual(task.parent);
            expect(taskFormat.priority).toEqual(task.priority);
            expect(taskFormat.section).toEqual(task.section);

            // title parsed through text.plain_text!!
            // expect(taskFormat.title).toEqual(task.title);

        })
    });


    describe("notion API calls", () => {
        const task: NotionTaskCreate = {
            done: Math.random() >= 0.5,
            labels: Math.random() >= 0.5 ? [] : ["label1", "label2"],
            title: "hello world",
            parent: "3c8635f18565489494b0355aa6e041d4",
        };

        if (Math.random() >= 0.5) task.priority = Priority.P3;
        if (Math.random() >= 0.5) task.section = "section1";


        const lastRecentDate = fromNow(-10000);

        const db: NotionDb = {
            id: task.parent,
            lastRecentDate,
            type: NotionDbType.TASK
        }

        it("creates new task", async () => {

            const page = await notion.createTask(task);
            expect(page).toHaveProperty("id");
            expect(page).toHaveProperty("last_edited_time");

            expect.setState({ id: page.id });
        })

        it("checks for new Tasks when it does exists", async () => {
            const { id } = expect.getState();
            const pages = await notion.checkForNewTasks(db);

            expect(pages.length).toBeGreaterThanOrEqual(1);
            const page = pages.find(p => p.id == id) as NotionTask;
            expect(page).toBeTruthy();

            expect(page.id).toEqual(id);
            expect(page.title).toEqual(task.title);
            expect(page.section).toEqual(task.section);
            expect(page.priority).toEqual(task.priority);
            expect(page.labels).toEqual(task.labels);
            expect(page.done).toEqual(task.done);

            db.lastRecentDate = firestore.Timestamp.fromDate(page.last_edited as Date);



        })
        it("check for new Tasks when it doesn't exits", async () => {
            const lastRecentDate = fromNow(1);

            const pages = await notion.checkForNewTasks({
                ...db,
                lastRecentDate
            });
            expect(pages).toHaveLength(0);
        })

        it("updates Tasks", async () => {
            const { id } = expect.getState();
            const task: NotionTaskUpdate = {
                done: Math.random() >= 0.5,
                id: "ID1",
                labels: Math.random() >= 0.4 ? [] : ["Changed1", "Changed2", "Changed3"],
                title: "UpdatedTitle",
            };

            if (Math.random() >= 0.5) task.priority = Priority.P1;
            if (Math.random() >= 0.5) task.section = "tech";

            const page = (await notion.updateTask({
                ...task,
                id,
            })) as NotionServerSingleTaskResponse;

            const data = Notion.convertSingleTaskPageResponseToNotionTask(page, db.id)
            expect(data.id).toEqual(id);
            expect(data.title).toEqual(task.title);
            if (task.section) expect(data.section).toEqual(task.section);
            if (task.priority) expect(data.priority).toEqual(task.priority);
            expect(data.labels).toEqual(task.labels);
            expect(data.done).toEqual(task.done);
        })
    })
})
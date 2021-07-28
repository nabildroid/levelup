import { NOTION_TOKEN } from ".";
import Notion from "../src/connectors/notion";
import { NotionDb, NotionDbType, NotionTask, NotionTaskPage } from "../src/types/notion";
import { Priority } from "../src/types/task";


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
            last_edited: new Date()
        };

        it("converts Task to accepted NotionAPI format", () => {

            const acceptedFormat = Notion.convertNotionTaskToNotionTaskPage(task);

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
            let acceptedFormat = Notion.convertNotionTaskToNotionTaskPage({
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

            acceptedFormat = Notion.convertNotionTaskToNotionTaskPage({
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
                properties: Notion.convertNotionTaskToNotionTaskPage(task),
                id: task.id,

            } as unknown as NotionTaskPage;

            const taskFormat = Notion.convertNotionTaskPageToNotionTask({
                ...notionAPIFormat,
                properties: {
                    ...notionAPIFormat.properties,
                    last_edited: {
                        id: "dsdzd",
                        type: "last_edited_time",
                        last_edited_time: (new Date()).toISOString(),
                    }
                }
            }, {
                id: task.parent,
                lastRecentDate: new Date(),
                type: NotionDbType.TASK
            });

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
        const task: NotionTask = {
            done: Math.random() >= 0.5,
            id: "ID1",
            labels: Math.random() >= 0.5 ? [] : ["label1", "label2"],
            title: "hello world",
            parent: "a29912913c7a4357a43938f0f6f0ccf5",
            last_edited: new Date()
        };

        if (Math.random() >= 0.5)
            task.priority = Priority.P3;
        if (Math.random() >= 0.5)
            task.section = "section1";

        const lastRecentDate = new Date( Date.now()  - 100000 );
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
            const pages = await notion.checkForNewTask(db);

            expect(pages.length).toBeGreaterThanOrEqual(1);

            expect(pages[0].id).toEqual(id);
            expect(pages[0].title).toEqual(task.title);
            expect(pages[0].section).toEqual(task.section);
            expect(pages[0].priority).toEqual(task.priority);
            expect(pages[0].labels).toEqual(task.labels);
            expect(pages[0].done).toEqual(task.done);
            
            db.lastRecentDate = (pages[0].last_edited as Date)
        })

        it("check for new Tasks when it doesn't exits",async ()=>{
            const lastRecentDate = new Date( Date.now()  + 100000 );

            const pages = await notion.checkForNewTask({
                ...db,
                lastRecentDate
            });
            expect(pages).toHaveLength(0);
        })

        it("updates Tasks", async () => {
            const { id } = expect.getState();
            const task: NotionTask = {
                done: Math.random() >= 0.5,
                id: "ID1",
                labels: Math.random() >= 0.4 ? [] : ["Changed1", "Changed2", "Changed3"],
                title: "UpdatedTitle",
                parent: "a29912913c7a4357a43938f0f6f0ccf5",
                last_edited: new Date()
            };

            if (Math.random() >= 0.5)
                task.priority = Priority.P1;
            if (Math.random() >= 0.5)
                task.section = "tech";

            const page = await notion.updateTask({
                ...task,
                id,
            })

            const data = Notion.convertNotionTaskPageToNotionTask(page as NotionTaskPage, db)
            expect(data.id).toEqual(id);
            expect(data.title).toEqual(task.title);
            expect(data.section).toEqual(task.section);
            expect(data.priority).toEqual(task.priority);
            expect(data.labels).toEqual(task.labels);
            expect(data.done).toEqual(task.done);
        })
    })
})
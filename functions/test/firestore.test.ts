import {firestore} from ".";

import { StoredTask } from "../src/types/task";
import { NotionDbType } from "../src/types/notion";
import { User } from "../src/types/user";


afterAll(() => {
    firestore.clear();

})

describe("test firestore Conector functionalities", () => {

    describe("validate User", () => {
        const userData = {
            auth: {
                notion: "notionAuth",
                todoist: "todoistAuth",
            },
            notionDB: [{
                id: "db1",
                type: NotionDbType.TASK,
                lastRecentDate: new Date()
            },
            {
                id: "db2",
                type: NotionDbType.TASK,
                lastRecentDate: new Date()
            },
            {
                id: "db3",
                type: NotionDbType.THOUGHT,
                lastRecentDate: new Date()
            }],
            todoistLabel: {
                1532: "label1",
                1533: "label2",
            },
            todoistProjects: [
                ["todo1", "db1"],
                ["todo2", "db2"],
                ["inbox"],
            ]
        } as User;

        beforeAll(async () => {
            await firestore.createUser(userData);
        });

        it("should create a Valide user", async () => {
            const user = await firestore.lazyLoadUser("nabil")

            expect(user).toEqual(userData);
        })
    })


    describe("validate storedTask", () => {
        beforeAll(async () => {
            await firestore.saveNewTask(["id1", "id2"], "nabil");
        })

        it("should return valide storedTask when NTID is full", async () => {

            const storedTask = await firestore.getStoredTask(["id1", "id2"]);

            expect(storedTask).toEqual({
                completed: false,
                id: ["id1", "id2"],
                user: "nabil",
            } as StoredTask)
        })

        it("should return valide storedTask when NTID contains one id", async () => {

            let storedTask = await firestore.getStoredTask(["id1"]);

            expect(storedTask).toEqual({
                completed: false,
                id: ["id1", "id2"],
                user: "nabil",
            } as StoredTask)

            storedTask = await firestore.getStoredTask(["id2"]);

            expect(storedTask).toEqual({
                completed: false,
                id: ["id1", "id2"],
                user: "nabil",
            } as StoredTask)
        })

    })

})
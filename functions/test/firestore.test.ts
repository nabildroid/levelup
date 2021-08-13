import { firestore } from ".";

import { StoredTask } from "../src/types/task";
import { NotionDbType } from "../src/types/notion";
import { User } from "../src/types/user";
import { fromNow } from "./utils";


beforeAll(async () => {
    await firestore.clear();
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
                lastRecentDate: fromNow()
            },
            {
                id: "db2",
                type: NotionDbType.TASK,
                lastRecentDate: fromNow()
            },
            {
                id: "db3",
                type: NotionDbType.THOUGHT,
                lastRecentDate: fromNow()
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


        it("should create a Valide user", async () => {
            await firestore.createUser(userData);

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
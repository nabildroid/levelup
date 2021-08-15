import FirestoreConnector from "../connectors/firestore";
import { NotionDbType } from "../types/notion";
import { StoredTask, NTID } from "../types/task";
import { User } from "../types/user";
import { fromNow, randomNotionID, randomTodoistID } from "../../test/utils";
export default async (db: FirestoreConnector) => {
    console.log(process.env.NOTION_TOKEN);

    await db.createUser(createUser());

    Array(10)
        .fill(null)
        .map(createStoredTask)
        .forEach((task) => db.saveNewTask(task.id, task.user));
};

function createStoredTask(): StoredTask {
    return {
        id: generateRandomNTID(),
        user: "nabil",
        completed: Math.random() > 10,
    };
}

export function createUser(): User {
    return {
        auth: {
            notion: process.env.NOTION_TOKEN || "auth token",
            todoist: "todoist token",
        },
        notionDB: [
            {
                id: "a29912913c7a4357a43938f0f6f0ccf5",
                type: NotionDbType.TASK,
                lastRecentDate: fromNow(-1000000),
            },
        ],
        todoistLabel: {
            15364521: "LabelA",
            15364561: "LabelB",
        }, // translating labels&section from id to string and vice versa
        todoistProjects: [
            ["1525221", "a29912913c7a4357a43938f0f6f0ccf5"],
            ["1525221", "a29912913c7a4357a43938f0f6f0ccf5"],
            ["1525221", "a29912913c7a4357a43938f0f6f0ccf5"],
        ],
    };
}

function generateRandomNTID(): [string, string] {
    return [randomNotionID(), randomTodoistID()];
}

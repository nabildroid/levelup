import { NotionDbType } from "../types/notion";
import { StoredTask, NTID } from "../types/task";

export default (db: FirebaseFirestore.Firestore) => {
    console.log(process.env.NOTION_TOKEN);
    const user = "nabil";
    const userPath = `/users/${user}`;
    const taskPath = `/tasks/`;

    db.doc(userPath).set(createUser());

    Array(10)
        .fill(null)
        .map(createStoredTask)
        .forEach((task) =>
            db.collection(taskPath).add(task)
        );

};

function createStoredTask(): StoredTask {
    return {
        id: generateRandomNTID(),
        user: "nabil",
        completed: Math.random() > 10,
    };
}

function createUser() {
    return {
        auth: {
            notion: process.env.NOTION_TOKEN || "auth token",
            todoist: "todoist token",
        },
        notionDB: [
            {
                id: "a29912913c7a4357a43938f0f6f0ccf5",
                type: NotionDbType.TASK,
                lastRecentDate: "2020-03-17T21:49:37.913Z",
            },
        ],
        todoistLabel: {
            15364521: "LabelA",
            15364561: "LabelB",
        }, // translating labels&section from id to string and vice versa
        todoistProjects: [
            [1525221, "a29912913c7a4357a43938f0f6f0ccf5"],
            [1525221, "a29912913c7a4357a43938f0f6f0ccf5"],
            [1525221, "a29912913c7a4357a43938f0f6f0ccf5"]
        ]
    };
}

function generateRandomNTID(): NTID {
    const randA = Math.random().toString().slice(2);
    const randB = Math.random().toString().slice(2);

    return [randA, randB];
}

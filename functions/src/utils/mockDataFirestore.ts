import { NotionDbType } from "../types/notion";
import { CompleteTask, NTID, TaskAssociation } from "../types/task";

export default (db: FirebaseFirestore.Firestore) => {
    console.log(process.env.NOTION_TOKEN);
    const user = "nabil";
    const userPath = `/users/${user}`;
    const completedTaskPath = `/completedTasks/`;
    const taskAssociationPath = `/taskAssociation/`;

    db.doc(userPath).set(createUser());

    Array(10)
        .fill(null)
        .map(createCompletedTask)
        .forEach(({ id, user }) =>
            db.collection(completedTaskPath + id).add({ user })
        );

    Array(10)
        .fill(null)
        .map(createTaskAssociation)
        .forEach(({ id }) =>
            db.collection(taskAssociationPath + id).add({ user })
        );
};

function createTaskAssociation(): TaskAssociation {
    return {
        id: generateRandomNTID(),
        user: "nabil",
    };
}

function createCompletedTask(): CompleteTask {
    return {
        id: generateRandomNTID(),
        user: "nabil",
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
    };
}

function generateRandomNTID(): NTID {
    const randA = Math.random().toString().slice(2);
    const randB = Math.random().toString().slice(2);

    return [randA, randB];
}

import { NotionDbType } from "../types/notion";

export default (db: FirebaseFirestore.Firestore) => {
    console.log(process.env.NOTION_TOKEN);
    const user = {
        auth: {
            notion: process.env.NOTION_TOKEN || "auth token",
            todoist: "todoist token",
        },
        notionDB: [
            {
                id: "a29912913c7a4357a43938f0f6f0ccf5",
                type: NotionDbType.TASK,
                lastRecentDate: "2020-03-17T21:49:37.913Z",
            }
        ],
        todoistLabel: {} // translating labels&section from id to string and vice versa
    }
    db.doc("/users/nabil").set(user);
}
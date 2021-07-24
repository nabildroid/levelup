import { NotionDbType } from "../types/notion";
import { User } from "../types/user"

export default (db: FirebaseFirestore.Firestore) => {
    console.log(process.env.NOTION_TOKEN);
    const user = {
        notionAuth: process.env.NOTION_TOKEN || "auth token",
        pomodoroDBID: {
            id: "a29912913c7a4357a43938f0f6f0ccf5",
            type: NotionDbType.POMODORO,
            lastRecentDate: "2020-03-17T21:49:37.913Z",
        },
        taskDB: []
    }
    db.doc("/users/nabil").set(user);
}
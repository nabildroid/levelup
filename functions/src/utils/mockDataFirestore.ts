import { User } from "../types/user"

export default (db: FirebaseFirestore.Firestore) => {
    console.log(process.env.NOTION_TOKEN);
    const user: User = {
        notionAuth: process.env.NOTION_TOKEN || "auth token",
        pomodoroDBID: {
            id: "a29912913c7a4357a43938f0f6f0ccf5",
            lastEdited: new Date()
        },
        taskDB: []
    }
    db.doc("/users/nabil").set(user);
}
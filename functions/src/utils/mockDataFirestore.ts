import { User } from "../types/user"

export default (db: FirebaseFirestore.Firestore) => {

    const user: User = {
        notionAuth: "notionAuth",
        pomodoroDBID: {
            id: "dfdfdf",
            lastEdited: new Date()
        },
        taskDB: [
            {
                id: "dfdfdf",
                lastEdited: new Date()
            },
            {
                id: "dfdfdf",
                lastEdited: new Date()
            }
        ]
    }
    db.doc("/users/nabil").set(user);
}
import * as functions from "firebase-functions";
import Notion from "../connectors/notion";
import { firestore, pubsub } from "..";
import { User } from "../types/user";


const users: { [key: string]: User } = {};



export default functions.https.onRequest(async (req, res) => {
    const user = await lasyLoadUser(req.query.user as string);
    const notion = new Notion(user.notionAuth);

    const allDBs = [user.pomodoroDBID, ...user.taskDB];


    allDBs.forEach(async db => {
        const updatedTasks = await notion.checkForNewUpdate(db);
        updatedTasks.forEach(task=>pubsub.publishNotionUpdate(task));
    });

    res.send("done");
})



const lasyLoadUser = async (user: string): Promise<User> => {
    if (users[user]) return Promise.resolve(users[user]);
    else {
        const docRef = firestore.doc(`users/${user}`) as FirebaseFirestore.DocumentReference<User>;

        const doc = await docRef.get();
        const data = doc.data();
        if (data) {
            return Promise.resolve({
                auth: data.auth,
                notionDB: data.notionDB.map(({ id, type, lastRecentDate }) => ({
                    id, type,
                    lastRecentDate: new Date(lastRecentDate)
                })),
                todoistLabel: data.todoistLabel
            });
        }
        throw Error("undefined user " + user);
    }
}
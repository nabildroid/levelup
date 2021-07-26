import * as functions from "firebase-functions";
import Notion, { INotion } from "../connectors/notion";
import { firestore, pubsub } from "..";
import { User } from "../types/user";
import { NotionDbType } from "../types/notion";

const users: { [key: string]: User } = {};

export default functions.https.onRequest(async (req, res) => {
    const user = await lasyLoadUser(req.query.user as string);
    const notion: INotion = new Notion(user.auth.notion);

    await Promise.all(
        user.notionDB.map(async (db) => {
            if (db.type == NotionDbType.TASK) {
                const updatedNotionTasks = await notion.checkForNewTask(db);

                updatedNotionTasks.forEach(
                    ({ done, id, priority, labels, parent, title, section }) =>
                        pubsub.publishNotionUpdate({
                            parent: `${parent}_`,
                            id: `${id}_`,
                            done,
                            priority,
                            labels,
                            title,
                            section,
                        })
                );
            }
        })
    );

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
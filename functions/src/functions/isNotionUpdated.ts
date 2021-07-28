import * as functions from "firebase-functions";
import Notion, { INotion } from "../connectors/notion";
import { pubsub } from "..";
import { NotionDbType } from "../types/notion";
import {firestore} from "..";


export default functions.https.onRequest(async (req, res) => {
    const user = await firestore.lazyLoadUser(req.query.user as string);

    const notion: INotion = new Notion(user.auth.notion);

    await Promise.all(
        user.notionDB.map(async (db) => {
            if (db.type == NotionDbType.TASK) {
                const updatedNotionTasks = await notion.checkForNewTask(db);

                updatedNotionTasks.forEach(
                    ({ done, id, priority, labels, parent, title, section }) =>
                        pubsub.notionInsertTask({
                            parent: [parent],
                            id: [id],
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



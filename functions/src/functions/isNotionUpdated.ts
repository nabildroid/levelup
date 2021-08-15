import * as functions from "firebase-functions";
import Notion from "../connectors/notion";
import { pubsub } from "..";
import { NotionDbType, NotionTask } from "../types/notion";
import { firestore } from "..";
import { PubsubSources } from "../types/pubsub";
import { Task } from "../types/task";

export default functions.https.onRequest(async (req, res) => {
    const user = await firestore.lazyLoadUser(
        (req.query.user || "nabil") as string
    );
    const notion = new Notion(user.auth.notion);

    const taskDBs = user.notionDB.filter((d) => d.type == NotionDbType.TASK);
    for await (const db of taskDBs) {
        const updatedTasks = await notion.checkForNewTasks(db);

        await Promise.all(updatedTasks.map(insertNotionTask));
    }

    res.send("done");
});

const insertNotionTask = async (notionTask: NotionTask) => {
    const { done, id, priority, labels, parent, title, section } = notionTask;
    const task: Task = {
        parent: [parent],
        id: [id],
        done,
        priority,
        labels,
        title,
        section,
    };

    return pubsub.insertTask(task, PubsubSources.Notion);
};

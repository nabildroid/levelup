import * as functions from "firebase-functions";
import { firestore } from "..";
import Notion from "../connectors/notion";
import {
    PubsubDetectedEventTypeAttributes,
    PubsubSources,
} from "../types/pubsub";
import { NTID, Task } from "../types/task";
import { extractAttributeAndBodyfromPubsubMessage } from "../utils/general";
import { ensureNotionTaskIdExists, newTask, updateTask } from "../utils/notionUtils";
import { translateTodoistLabels } from "../utils/todoistUtils";

export default functions.https.onRequest(async (req, res) => {
    const message = extractAttributeAndBodyfromPubsubMessage(req.body.message);
    const attributes = message.attributes as PubsubDetectedEventTypeAttributes;
    const body = message.body as { id: NTID } | Task;

    // todo use User.todoistProject to find the right userId
    const user = await firestore.lazyLoadUser("nabil");
    const notion = new Notion(user.auth.notion);


    if (attributes.type == "complete" || attributes.type == "uncomplete") {
        const { id } = body as { id: NTID };
        const task = {
            id: await ensureNotionTaskIdExists(id, firestore),
            done: attributes.type == "complete",
        };
        await updateTask(task, notion);

    } else {
        const task = body as Task;
        if (task.labels && attributes.source == PubsubSources.Todoist) {
            task.labels = translateTodoistLabels(user, task.labels);
        }

        if (attributes.type == "new") {
            const { id } = await newTask(task, user, notion);
            await firestore.saveNewTask([task.id[0], id], "nabil");

        } else if (attributes.type == "update") {
            const id = await ensureNotionTaskIdExists(task.id, firestore);
            await updateTask({
                ...task,
                id,
            }, notion);
            // todo save back last_edited_time in the user
        }
    }


    res.send("done");
});


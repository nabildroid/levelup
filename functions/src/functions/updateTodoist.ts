import * as functions from "firebase-functions";
import { firestore } from "..";
import TodoistConnector from "../connectors/todoist";
import { PubsubDetectedEventTypeAttributes } from "../types/pubsub";
import { NTID, Task } from "../types/task";
import { extractAttributeAndBodyfromPubsubMessage } from "../utils/general";
import {
    ensureTodoistTaskIdExists,
    translateTodoistLabels,
    newTask,
    updateTask,
    extractTodoistIdfromNTID,
} from "../utils/todoistUtils";

export default functions.https.onRequest(async (req, res) => {
    const message = extractAttributeAndBodyfromPubsubMessage(req.body.message);
    const attributes = message.attributes as PubsubDetectedEventTypeAttributes;
    const body = message.body as { id: NTID } | Task;

    // todo use User.todoistProject to find the right userId
    const user = await firestore.lazyLoadUser("nabil");
    const todoist = new TodoistConnector(user.auth.todoist);

    if (attributes.type == "complete" || attributes.type == "uncomplete") {
        const id = await ensureTodoistTaskIdExists(
            (body as { id: NTID }).id,
            firestore
        );

        const taskId = extractTodoistIdfromNTID(id);
        if (!taskId) {
            throw Error(
                `couldn't ${attributes.type} Todoist Task without having an ID ` +
                    JSON.stringify(id)
            );
        } else {
            if (attributes.type == "complete") {
                await todoist.closeTask(taskId);
            } else {
                await todoist.reopenTask(taskId);
            }
        }
    } else {
        const task = body as Task;

        if (task.labels) {
            task.labels = translateTodoistLabels(user, task.labels);
        }

        if (attributes.type == "new") {
            const { id } = await newTask(task, user, todoist);
            await firestore.saveNewTask([task.id[0], id.toString()], "nabil");
        } else if (attributes.type == "update") {
            const id = await ensureTodoistTaskIdExists(task.id, firestore);
            await updateTask({ ...task, id }, todoist);
        }
    }

    // todo save back last_edited_time in the user

    res.send("done");
});

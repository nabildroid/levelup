import * as functions from "firebase-functions";
import { pubsub } from "..";
import { PubsubInsertedSource } from "../types/pubsub";
import { Task } from "../types/task";
import { TodoistWebhook, TodoistWebhookType } from "../types/todoist";
import { toPriority } from "../utils/general";




export default functions.https.onRequest(async (req, res) => {

    const { event_data, event_name } = req.body as TodoistWebhook;

    const { checked, id, labels, content, priority, project_id, section_id } = event_data;

    const task: Task = {
        id: [id.toString()],
        done: checked,
        parent: [project_id.toString()],
        labels,
        title: content,
        priority: toPriority(priority),
        section: section_id?.toString()
    }

    if (event_name == TodoistWebhookType.NewTask) {
        await pubsub.detectedEventType(task, {
            source: PubsubInsertedSource.Todoist,
            type: "new"
        })
    } else if (event_name == TodoistWebhookType.UpdatedTask) {
        await pubsub.detectedEventType(task, {
            source: PubsubInsertedSource.Todoist,
            type: "update"
        })
    } else if (event_name == TodoistWebhookType.CompletedTask) {
        await pubsub.validateTask(task, PubsubInsertedSource.Todoist)
    } else {

        console.log("unsuppored event name");
    }

    res.send("done");
});

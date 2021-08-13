import * as functions from "firebase-functions";
import { pubsub } from "..";
import { PubsubSources } from "../types/pubsub";
import { Task } from "../types/task";
import { TodoistWebhook, TodoistWebhookType } from "../types/todoist";
import { toPriority } from "../utils/general";




export default functions.https.onRequest(async (req, res) => {

    const { event_data, event_name } = req.body as TodoistWebhook;

    const { checked, id, labels, content, priority, project_id, section_id } = event_data;

    const task: Task = {
        id: [id.toString()],
        done: checked || false,
        parent: [project_id.toString()],
        labels: labels.map(v => v.toString()),
        title: content,
        priority: toPriority(priority),
        section: section_id?.toString()
    }

    if (event_name == TodoistWebhookType.NewTask) {
        await pubsub.detectedEventType(task, {
            source: PubsubSources.Todoist,
            type: "new"
        })
    } else if (event_name == TodoistWebhookType.UpdatedTask) {
        //https://www.notion.so/laknabil/Todoist-Webhook-update-is-Sending-the-task-to-FindWhere-instead-of-DetectedTaskEvent-1e2aed48c4a14997aa6dfe8a19b4825e
        await pubsub.todoistInsertTask(task);
    } else if (event_name == TodoistWebhookType.CompletedTask) {
        await pubsub.validateTask(task.id, PubsubSources.Todoist)
    } else {

        console.log("unsuppored event name");
    }

    res.send("done");
});

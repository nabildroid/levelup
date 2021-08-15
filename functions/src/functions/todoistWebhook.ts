import * as functions from "firebase-functions";
import { pubsub } from "..";
import { PubsubSources } from "../types/pubsub";
import { Task } from "../types/task";
import { TodoistWebhook, TodoistWebhookType } from "../types/todoist";
import { toPriority } from "../utils/general";

export default functions.https.onRequest(async (req, res) => {
    const { event_data, event_name } = req.body as TodoistWebhook;
    const task = convertEventDataToTask(event_data);

    if (event_name == TodoistWebhookType.NewTask) {
        await pubsub.detectedEventType(task, {
            source: PubsubSources.Todoist,
            type: "new",
        });
    } else if (event_name == TodoistWebhookType.UpdatedTask) {
        await pubsub.insertTask(task, PubsubSources.Todoist);
    } else if (event_name == TodoistWebhookType.CompletedTask) {
        await pubsub.validateTask(task.id, PubsubSources.Todoist);
    } else {
        console.error(`unsuppored event name [${event_name}]`);
    }

    res.send("done");
});

const convertEventDataToTask = (
    event_data: TodoistWebhook["event_data"]
): Task => ({
    id: [event_data.id.toString()],
    done: !!event_data.checked,
    parent: [event_data.project_id.toString()],
    labels: event_data.labels.map(toString),
    title: event_data.content,
    priority: toPriority(event_data.priority),
    section: event_data.section_id?.toString(),
});

import * as functions from "firebase-functions";
import { firestore } from "..";
import FirestoreConnector from "../connectors/firestore";
import Notion from "../connectors/notion";
import { NotionDbType } from "../types/notion";
import {
    PubsubDetectedEventTypeAttributes,
    PubsubSources,
} from "../types/pubsub";
import { NTID, Task } from "../types/task";
import { User } from "../types/user";

export default functions.https.onRequest(async (req, res) => {
    const attributes = JSON.parse(
        req.headers.attributes as string
    ) as PubsubDetectedEventTypeAttributes;
    console.log(attributes);
    const body = req.body as { id: NTID } | Task;
    console.log(body);
    // todo use User.todoistProject to find the right userId
    const user = await firestore.lazyLoadUser("nabil");
    const notion = new Notion(user.auth.notion);

    if (attributes.type == "complete" || attributes.type == "uncomplete") {
        const { id } = body as { id: NTID };
        const task = {
            id: await ensureNotionTaskIdExists(id, firestore),
            done: attributes.type == "complete",
        };

        const {} = await updateTask(task, notion);
    } else {
        const task = body as Task;

        if (task.labels && attributes.source == PubsubSources.Todoist) {
            task.labels = translateTodoistLabels(user, task.labels);
        }

        if (attributes.type == "new") {
            const { id } = await newTask(task, user, notion);
            console.log("New Task Id ["+id);
            await firestore.saveNewTask([task.id[0], id], "nabil");
            console.log("Stored task ",[task.id[0], id]);
        } else if (attributes.type == "update") {
            console.log("Updating ...");
            const id = await ensureNotionTaskIdExists(task.id, firestore);
            console.log(id);
            console.log(await updateTask({ ...task, id }, notion));
        }
    }

    // todo save back last_edited_time in the user

    res.send("done");
});

// required the parent ID
export const newTask = async (task: Task, user: User, notion: Notion) => {
    const fullNTID = getFullNTID(user, task.parent);

    const parentId = extractNotionIdfromNTID(fullNTID) as string;

    const response = await notion.createTask({
        ...task,
        parent: parentId,
        id: task.id[0], // todo useless information
    });
    const { id, last_edited_time } = response;
    // todo  response.last_edited_time must be saved withing the user stuff!

    return { id, last_edited_time };
};

// todo remove Notion dependency from arguments
export const updateTask = async (
    task: Partial<Task> & { id: [string, string] },
    notion: Notion
) => {
    const id = extractNotionIdfromNTID(task.id) as string;

    const response = await notion.updateTask({
        ...task,
        id,
        parent: undefined,
    });

    const { last_edited_time } = response;

    return { id, last_edited_time };
};

export const ensureNotionTaskIdExists = async (
    id: NTID,
    firestore: FirestoreConnector
) => {
    if (extractNotionIdfromNTID(id) == undefined) {
        const storedTask = await firestore.getStoredTask(id);
        if (storedTask) {
            return storedTask.id as [string, string];
        }
    }
    return id as [string, string];
};

export const translateTodoistLabels = <T extends string[] | number[]>(
    user: User,
    labels: string[]
) => {
    return Object.entries(user.todoistLabel)
        .map(([key, value]) => {
            if (labels.includes(key)) return value;
            if (labels.includes(value)) return key;
        })
        .filter((v) => v) as string[];
};

export const getFullNTID = (user: User, id: NTID): NTID => {
    const { todoistProjects } = user;

    const [firstId] = id;
    let secondId: string | undefined;

    for (const project of todoistProjects) {
        if (firstId == project[0] || firstId == project[1]) {
            secondId = firstId == project[0] ? project[1] : project[0];
            break;
        }
    }

    // if notionDB doesn't exists with current TodoistProject associate NotionThoughts db with this project (AKA inbox)
    if (!secondId) {
        const thoughtDB = user.notionDB.find(
            (db) => db.type == NotionDbType.THOUGHT
        );

        secondId = thoughtDB?.id;
    }

    return [firstId, secondId];
};

export const extractNotionIdfromNTID = (id: NTID) => {
    return id[0].length > 30 ? id[0] : id[1];
};

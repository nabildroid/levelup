import * as functions from "firebase-functions";
import {firestore} from "..";
import Notion from "../connectors/notion";
import { NotionDbType } from "../types/notion";
import { PubsubDetectedEventTypeAttributes, PubsubSources } from "../types/pubsub";
import { NTID, Task } from "../types/task";
import { User } from "../types/user";



export default functions.https.onRequest(async (req, res) => {

    const attributes = JSON.parse(req.headers.attributes as string) as PubsubDetectedEventTypeAttributes

    const body = req.body as { id: NTID } | Task;

    // todo use User.todoistProject to find the right userId
    const user = await firestore.lazyLoadUser("nabil")
    const notion = new Notion(user.auth.notion);
    let last_edited_time: string;


    if (attributes.type == "complete" || attributes.type == "uncomplete") {
        const { id } = body as { id: NTID };
        last_edited_time = await handleUpdateTask({
            id,
            done: attributes.type == "complete"
        }, notion)
    } else {


        const task = body as Task;

        if (task.labels && attributes.source == PubsubSources.Todoist) {
            task.labels = translateTodoistLabels(user, task.labels);
        }

        if (extractNotionIdfromNTID(task.id) == undefined) {
            const storedTask = await firestore.getStoredTask(task.id);
            task.id[1] = storedTask?.id[1];
        }

        if (attributes.type == "new") {
            const fullNTID = getFullNTID(user, task.parent)
            last_edited_time = await handleNewTask({
                ...task,
                parent: fullNTID
            }, "nabil", notion);
        }
        else {
            last_edited_time = await handleUpdateTask(task, notion);
        }

    }

    // todo save back last_edited_time in the user

    res.send("done");

});

// required the parent ID
const handleNewTask = async (task: Task, user: string, notion: Notion) => {

    const parentId = extractNotionIdfromNTID(task.parent) as string;

    const response = await notion.createTask({
        ...task,
        parent: parentId,
        id: task.id[0], // todo useless information
    });


    // todo  response.last_edited_time must be saved withing the user stuff!

    await firestore.saveNewTask([task.id[0], response.id], user);

    return response.last_edited_time;
}

// todo remove Notion dependency from arguments
const handleUpdateTask = async (task: Partial<Task> & { id: NTID }, notion: Notion) => {

    const id = extractNotionIdfromNTID(task.id) as string;

    const response = await notion.updateTask({
        ...task,
        id,
        parent: undefined
    });

    return response.last_edited_time;
}




export const translateTodoistLabels = (user: User, labels: string[]) => {
    return labels.map(label =>
        user.todoistLabel[parseInt(label)]
    )
}


export const getFullNTID = (user: User, id: NTID): NTID => {

    const { todoistProjects } = user;

    const [firstId] = id;
    let secondId: string | undefined;

    for (const project of todoistProjects) {
        if (firstId == project[0] || firstId == project[1]) {
            secondId = firstId == project[0] ? project[1] : project[0]
            break;
        }
    }

    // if notionDB doesn't exists with current TodoistProject associate NotionThoughts db with this project (AKA inbox)
    if (!secondId) {
        const thoughtDB = user.notionDB.find(db => db.type == NotionDbType.THOUGHT);

        secondId = thoughtDB?.id
    }

    return [firstId, secondId]
}

export const extractNotionIdfromNTID = (id: NTID) => {
    return (id[0].length > 30 ? id[0] : id[1]);
}
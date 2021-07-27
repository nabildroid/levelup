import * as functions from "firebase-functions";
import Firestore from "../connectors/firestore";
import Notion from "../connectors/notion";
import { NotionDbType } from "../types/notion";
import { PubsubDetectedEventTypeAttributes, PubsubSources } from "../types/pubsub";
import { NTID, Task } from "../types/task";
import { User } from "../types/user";



export default functions.https.onRequest(async (req, res) => {

    const attributes = JSON.parse(req.headers.attributes as string) as PubsubDetectedEventTypeAttributes

    const body = req.body as { id: NTID } | Task;

    // todo use User.todoistProject to find the right userId
    const user = await Firestore.lazyLoadUser("nabil")
    const notion = new Notion(user.auth.notion);

    if (attributes.type == "complete" || attributes.type == "uncomplete") {
        const { id } = body as { id: NTID };
        return handleUpdateTask({
            id,
            done: attributes.type == "complete"
        }, notion)
    } else {


        const task = body as Task;

        if (task.labels && attributes.source == PubsubSources.Todoist) {
            task.labels = translateTodoistLabels(user, task.labels);
        }

        if (attributes.type == "new") {
            const fullNTID = getFullNTID(user, task.parent)
            return handleNewTask({
                ...task,
                parent: fullNTID
            }, "nabil", notion);
        }
        else return handleUpdateTask(task, notion);
    }


});

// required the parent ID
const handleNewTask = async (task: Task, user: string, notion: Notion) => {

    const parentId = (task.parent[0].length > 30 ? task.parent[0] : task.parent[1]) as string;

    const response = await notion.createTask({
        ...task,
        parent: parentId,
        id: task.id[0], // todo useless information
    });

    
    // todo  response.last_edited_time must be saved withing the user stuff!

    await Firestore.saveNewTask([task.id[0], response.id], user);
}

// todo remove Notion dependency from arguments
const handleUpdateTask = async (task: Partial<Task> & { id: NTID }, notion: Notion) => {

}




const translateTodoistLabels = (user: User, labels: string[]) => {
    return labels.map(label =>
        user.todoistLabel[parseInt(label)]
    )
}


const getFullNTID = (user: User, id: NTID): NTID => {

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
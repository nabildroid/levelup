import FirestoreConnector from "../connectors/firestore";
import Notion from "../connectors/notion";
import { NotionDbType } from "../types/notion";
import { NTID, Task } from "../types/task";
import { User } from "../types/user";
import { getFullNTID } from "./general";




// required the parent ID
export const newTask = async (task: Task, user: User, notion: Notion) => {
    const fullNTID = getFullNTID(user, task.parent);

    const parentId = extractNotionIdfromNTID(fullNTID) as string;

    const response = await notion.createTask({
        ...task,
        parent: parentId,
    });
    const { id, last_edited_time } = response;
    // todo  response.last_edited_time must be saved withing the user stuff!

    return { id };
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
    });

    const { last_edited_time } = response;

    return { id };
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

export const extractNotionIdfromNTID = (id: NTID) => {
    return id[0].length > 30 ? id[0] : id[1];
};

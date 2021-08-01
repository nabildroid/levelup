import FirestoreConnector from "../connectors/firestore";
import Notion from "../connectors/notion";
import { NotionDbType } from "../types/notion";
import { NTID, Task } from "../types/task";
import { User } from "../types/user";

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

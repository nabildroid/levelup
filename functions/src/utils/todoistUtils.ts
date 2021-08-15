import FirestoreConnector from "../connectors/firestore";
import TodoistConnector from "../connectors/todoist";
import { NewTask, NTID, Task, UpdateTask } from "../types/task";
import { TodoistNewTask } from "../types/todoist";
import { User } from "../types/user";
import { fromPriority, getFullNTID } from "./general";

// required the parent ID
export const newTask = async (
    task: NewTask,
    user: User,
    todoist: TodoistConnector
) => {
    const fullNTID = getFullNTID(user, task.parent);

    const project_id = extractTodoistIdfromNTID(fullNTID);

    const todoistTask = Object.assign(
        {
            content: task.title,
            labels: (task.labels as number[]) ?? [],
            priority: fromPriority(task.priority),
        },
        task.section ? { section_id: parseInt(task.section) } : {},
        project_id ? { project_id: parseInt(project_id) } : {}
    ) as TodoistNewTask;

    const response = await todoist.createTask(todoistTask);

    const { id } = response;
    // todo  response.last_edited_time must be saved withing the user stuff!

    return { id };
};

export const updateTask = async (
    task: UpdateTask,
    todoist: TodoistConnector
) => {
    const id = extractTodoistIdfromNTID(task.id);
    if (!id) {
        throw Error(
            "couldn't update Todoist Task without having an ID " +
                JSON.stringify(task.id)
        );
    }

    const response = await todoist.updateTask({
        id,
        content: task.title,
        labels: (task.labels as number[]) ?? [],
        priority: fromPriority(task.priority),
        section_id: task.section ? parseInt(task.section) : undefined,
    });

    return { id };
};

export const ensureTodoistTaskIdExists = async (
    id: NTID,
    firestore: FirestoreConnector
) => {
    if (id.length < 2 || !extractTodoistIdfromNTID(id)) {
        const storedTask = await firestore.getStoredTask(id);
        if (storedTask) {
            return storedTask.id as [string, string];
        }
    }
    return id as [string, string];
};

export const extractTodoistIdfromNTID = (id: NTID) => {
    const [id1, id2] = id;

    if (id1.length > 5 && id1.length < 20) {
        return id1;
    }

    if (id2 && id2.length > 5 && id2.length < 20) {
        return id2;
    }

    return undefined;
};

export const translateTodoistLabels = (
    user: User,
    labels: (string | number)[]
) => {
    return Object.entries(user.todoistLabel)
        .map(([key, value]) => {
            if (labels.includes(parseInt(key))) return value;
            if (labels.includes(value)) return parseInt(key);
        })
        .filter((v) => v) as (string | number)[];
};
export const dateAcceptedByTodoist = (date: Date) => {
    const p1 = date.toLocaleDateString();
    const p2 = date.getHours() + ":" + date.getMinutes();

    return p1 + " " + p2;
};

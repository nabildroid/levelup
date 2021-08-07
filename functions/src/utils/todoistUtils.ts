import FirestoreConnector from "../connectors/firestore";
import TodoistConnector from "../connectors/todoist";
import { NewTask, NTID, Task, UpdateTask } from "../types/task";
import { User } from "../types/user";
import { fromPriority, getFullNTID } from "./general";




// required the parent ID
export const newTask = async (task: NewTask, user: User, todoist: TodoistConnector) => {
    const fullNTID = getFullNTID(user, task.parent);

    const project_id = extractTodoistIdfromNTID(fullNTID);


    const response = await todoist.createTask({
        project_id,
        content: task.title,
        labels: task.labels ? task.labels.map(parseInt) : [],
        priority: fromPriority(task.priority),
        section_id: task.section ? parseInt(task.section) : undefined,
    });

    const { id } = response;
    // todo  response.last_edited_time must be saved withing the user stuff!

    return { id };
};


export const updateTask = async (
    task: UpdateTask,
    todoist: TodoistConnector
) => {
    const id = extractTodoistIdfromNTID(task.id);

    const response = await todoist.updateTask({
        id,
        content: task.title,
        labels: task.labels ? task.labels.map(parseInt) : [],
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
    if (id.length < 2) throw Error("NTID should contains two values, received " + JSON.stringify(id));

    const [id1, id2] = id;
    if (typeof id1 == "number")
        return id1;
    if (id1.length > 5 && id1.length < 20)
        return parseInt(id1);


    return parseInt(id2 as string);
};




export const translateTodoistLabels = (
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
export const dateAcceptedByTodoist = (date: Date) => {
    const p1 = date.toLocaleDateString();
    const p2 = date.getHours() + ":" + date.getMinutes();

    return p1 + " " + p2;
}
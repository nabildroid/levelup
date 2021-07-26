import { Priority } from "../types/task";

export const toPriority = (priority: string | number | undefined): Priority => {
    console.log("priority", priority)
    if (!priority)
        return Priority.P3;

    if (priority.toString().includes("1"))
        return Priority.P1;
    else if (priority.toString().includes("2"))
        return Priority.P2
    else return Priority.P3
}
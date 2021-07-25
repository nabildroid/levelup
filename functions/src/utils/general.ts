import { Priority } from "../types/task";

export const toPriority = (priority: string): Priority => {
    if (priority.includes("1"))
        return Priority.P1;
    else if (priority.includes("1"))
        return Priority.P1
    else return Priority.P3
}
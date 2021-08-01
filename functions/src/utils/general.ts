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

export const fromPriority = (priority?: Priority): number => {
    if (priority == Priority.P1) {
        return 4;
    } else if (priority == Priority.P2) {
        return 3;
    }
    else if (priority == Priority.P3) {
        return 2;
    }
    return 1;
}
export const nestedArrayToObject = (arr: any[][]) => {
    return arr.reduce((out, val, index) => Object.assign(out, { [index]: val }), {});
}

export const objectToNestedArray = (obj: { [key: number]: any[] }) => {
    return Object.values(obj).reduce((arr, val) => [...arr, val], []);
}
import { NotionDbType } from "../types/notion";
import { NTID, Priority } from "../types/task";
import { User } from "../types/user";

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




export const nestedArrayToObject = (arr: any[][]) => {
    return arr.reduce((out, val, index) => Object.assign(out, { [index]: val }), {});
}

export const objectToNestedArray = (obj: { [key: number]: any[] }) => {
    return Object.values(obj).reduce((arr, val) => [...arr, val], []);
}
import { NTID, Task } from "./task"

export enum PubsubSources {
    Notion = "notion",
    Todoist = "todoist",
    Pomodoro = "pomodoro",
    Pocket = "pocket",
}

export type PubsubInsertTaskAttributes = {
    source: PubsubSources
}

export type PubsubDetectedEventTypeAttributes = {
    type: keyof PubsubDetectedEventTypeMessageType,
    source: PubsubSources,
}


export type PubsubValidateTaskAttributes = {
    source: PubsubSources,
}


export type PubsubDetectedEventTypeMessageType = {
    new: Task,
    update: Partial<Task>,
    complete: NTID,
    uncomplete: NTID,
}




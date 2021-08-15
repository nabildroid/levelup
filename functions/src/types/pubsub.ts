import { NewTask, NTID, Task, UpdateTask } from "./task";

export enum PubsubSources {
    Notion = "notion",
    Todoist = "todoist",
    Pomodoro = "pomodoro",
    Pocket = "pocket",
}

export type PubsubDetectedEventTypeMessageType = {
    new: NewTask;
    update: UpdateTask;
    complete: { id: NTID };
    uncomplete: { id: NTID };
};

// Pubsub Topic Attributes
export type PubsubInsertTaskAttributes = {
    source: PubsubSources;
};

export type PubsubDetectedEventTypeAttributes = {
    type: keyof PubsubDetectedEventTypeMessageType;
    source: PubsubSources;
};

export type PubsubValidateTaskAttributes = {
    source: PubsubSources;
};

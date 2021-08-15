export enum TodoistWebhookType {
    NewTask = "item:added",
    UpdatedTask = "item:updated",
    DeletedTask = "item:deleted",
    CompletedTask = "item:completed",
    UncompletedTask = "item:uncompleted",
}

export interface TodoistNewTask {
    content: string;
    priority: number;
    labels?: number[]; // need DB to evaluate

    project_id?: string; // optional for targeting Inbox!
    section_id?: number; // need DB to evaluate
}

export interface TodoistTask extends TodoistNewTask {
    id: string;
    project_id: string; // need DB to evaluate
    section_id: number;
    labels: number[];
    checked: boolean;
}

export interface TodoistTaskUpdate {
    id: string;
    content?: string;
    priority?: number;
    labels?: number[]; // need DB to evaluate
    project_id?: string; // optional for targeting Inbox!
    section_id?: number; // need DB to evaluate
}

export type TodoistWebhook = {
    event_name: TodoistWebhookType;
    user_id: number;
    event_data: TodoistTask;
};

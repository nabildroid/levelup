
export enum TodoistWebhookType {
    NewTask = "item:added",
    UpdatedTask = "item:updated",
    DeletedTask = "item:deleted",
    CompletedTask = "item:completed",
    UncompletedTask = "item:uncompleted", // todo fix the typo
}


export interface TodoistNewTask {
    content: string,
    priority: number,
    labels: number[], // need DB to evaluate

    project_id?: number, // need DB to evaluate
    section_id?: number, // need DB to evaluate
}

export interface TodoistTask extends TodoistNewTask {
    id: number,
    project_id: number, // need DB to evaluate
    section_id: number,
    checked: boolean,
}


export type TodoistWebhook = {
    event_name: TodoistWebhookType,
    user_id: number,
    event_data: TodoistTask & { id: number, project_id: number }
}
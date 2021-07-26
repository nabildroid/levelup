
export enum TodoistWebhookType {
    NewTask = "item:added",
    UpdatedTask = "item:updated",
    DeletedTask = "item:deleted",
    CompletedTask = "item:completed",
    UncompletedTask = "item:uncompleted", // todo fix the typo
}


export type TodoistWebhook = {
    event_name: TodoistWebhookType,
    user_id: number,
    event_data: {
        id: number,
        priority: string,
        content: string,
        project_id: number, // need DB to evaluate
        section_id?: number, // need DB to evaluate
        checked: boolean,
        labels: string[], // need DB to evaluate
    }
}
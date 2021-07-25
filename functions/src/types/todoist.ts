
export enum TodoistWebhookType {
    NewTask = "item:added",
    UpdatedTask = "item:updated",
    DeletedTask = "item:deleted",
    CompletedTask = "item:completed",
    IncompletedTask = "item:uncompleted",
}


export type TodoistWebhook = {
    event_name: TodoistWebhookType,
    user_id: number,
    event_data: {
        priority: string,
        content: string,
        project_id?: number,
        section_id?: number,
        checked: boolean,
        labels: string[],
    }
}
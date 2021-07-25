import { NotionDb } from "./notion";



export type User = {
    auth: {
        notion: string,
        todoist: string,
    },
    notionDB: NotionDb[],
    todoistLabel: { [id: number]: string }
}
import { NotionDb } from "./notion";



export type User = {
    notionAuth: string,
    pomodoroDBID: NotionDb,
    taskDB: NotionDb[],
}
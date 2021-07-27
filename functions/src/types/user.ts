import { NotionDb } from "./notion";
import { NTID } from "./task";



export type User = {
    auth: {
        notion: string,
        todoist: string,
    },
    notionDB: NotionDb[],
    todoistLabel: { [id: number]: string },
    todoistProjects: NTID[], // https://www.notion.so/laknabil/User-todoistProject-for-associating-todoist-project-with-notion-databases-is-a-quick-fix-e4cffc4edde247be817d86c46be4d8eb
}
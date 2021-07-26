import { Client } from "@notionhq/client";
import { NotionDb, NotionDbType, NotionServerTaskDBReponse, NotionTask, NotionTaskPage } from "../types/notion";
import { toPriority } from "../utils/general";

export interface INotion {
    checkForNewTask: (db: NotionDb) => Promise<NotionTask[]>
}

export default class Notion implements INotion {
    private client: Client;

    constructor(auth: string) {
        this.client = new Client({ auth });
    }

    async checkForNewTask(db: NotionDb): Promise<NotionTask[]> {
        if (db.type != NotionDbType.TASK)
            throw Error(`${db.id} is not of type Tasks`)

        const database = await this.client.databases.query({
            database_id: db.id,
            filter:
            {
                or: [
                    {
                        property: "last_edited",
                        date: {
                            after: db.lastRecentDate.toISOString(),
                        }
                    }
                ]
            }
        }) as NotionServerTaskDBReponse;

        // todo returns NotionServerTaskDBReponse but it should be flaten 
        return database.results.map(
            page => Notion.convertNotionTaskPageToNotionTask(page, db)
        );
    }

    static convertNotionTaskPageToNotionTask(task: NotionTaskPage, db: NotionDb): NotionTask {
        return ({
            id: task.id,
            parent: db.id,
            title: task.properties.title.title.map(t => t.plain_text).join(" "),
            done: task.properties.done.checkbox,
            labels: task.properties.labels.multi_select.map(s => s.name as string),
            priority: task.properties.priority?.select.name
                ? toPriority(task.properties.priority.select.name) : undefined,
            last_edited: new Date(task.properties.last_edited.last_edited_time),
            section: task.properties.section?.select.name
        })
    }
}

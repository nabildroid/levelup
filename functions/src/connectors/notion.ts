import { Client } from "@notionhq/client";
import { NotionDb, NotionServerTaskDBReponse, NotionTaskDBProperities } from "../types/notion";
import { Task } from "../types/task";
import { toPriority } from "../utils/general";

export default class Notion {
    private client: Client;

    constructor(auth: string) {
        this.client = new Client({ auth });
    }

    async checkForNewUpdate(db: NotionDb): Promise<Task[]> {

        const database = await this.client.databases.query({
            database_id: db.id,
            filter:
            {
                or: [
                    {
                        property: ("last_edited") as NotionTaskDBProperities,
                        date: {
                            after: db.lastRecentDate.toISOString(),
                        }
                    }
                ]
            }
        }) as NotionServerTaskDBReponse;

        return database.results.map(item => ({
            id: item.id,
            parent: db.id,
            title: item.properties.title.title.map(t => t.plain_text).join(" "),
            done: item.properties.done.checkbox,
            labels: item.properties.labels.multi_select.map(s => s.name as string),
            priority: item.properties.priority.select.name
                ? toPriority(item.properties.priority.select.name) : undefined,
        }));

    }
}

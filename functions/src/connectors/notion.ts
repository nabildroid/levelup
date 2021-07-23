import { Client } from "@notionhq/client";
import { NotionDb } from "../types/notion";

export default class Notion {
    private client: Client;

    constructor(auth: string) {
        this.client = new Client({ auth });
    }

    async checkForNewUpdate(db: NotionDb) {
        const database = await this.client.databases.retrieve({
            database_id: db.id
        });

        return new Date(database.created_time).getTime() == db.lastEdited.getTime()
    }




}

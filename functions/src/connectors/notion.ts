import { Client } from "@notionhq/client";
import { InputPropertyValueMap } from "@notionhq/client/build/src/api-endpoints";
import { InputPropertyValue } from "@notionhq/client/build/src/api-types";
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

    private createItem(item: { [key: string]: InputPropertyValue }, database_id: string) {
        return this.client.pages.create({
            parent: {
                database_id
            },
            properties: item
        })
    }

    async updateTask(task: Partial<NotionTask> & { id: string }) {
        return this.client.pages.update({
            page_id: task.id,
            properties: Notion.convertNotionTaskToNotionTaskPage(task),
            archived: false,
        })
    }


    async createTask(task: NotionTask) {
        // todo needs refactoring someting like that convertNotionTaskPageToNotionTask
        return this.createItem(Notion.convertNotionTaskToNotionTaskPage(task), task.parent);
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

    static convertNotionTaskToNotionTaskPage(task: Partial<NotionTask>) {

        type NotionTaskProperities = keyof NotionTask;
        const properties: InputPropertyValueMap = {};


        Object.keys(task).forEach(key => {
            // todo use if statement better then the switch
            switch (key as NotionTaskProperities) {
                case "title":
                    properties["title"] = {
                        type: "title",
                        title: [
                            {
                                type: "text",
                                text: { content: task.title as string },
                            },
                        ],
                    }
                    break;
                case "labels":
                    properties["labels"] = {
                        type: "multi_select",
                        multi_select: (task.labels as string[]).map(l => ({ name: l }))
                    }
                    break;

                case "priority":
                    properties["priority"] = {
                        type: "select",
                        select: { name: task.priority as string }
                    }
                    break;

                case "section":
                    properties["section"] = {
                        type: "select",
                        select: { name: task.section as string }
                    }
                    break;

                case "done":
                    properties["done"] = {
                        type: "checkbox",
                        checkbox: task.done as boolean
                    }
                    break;

                default:
                    break;
            }
        })
        return properties;
    }
}

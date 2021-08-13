import { Client } from "@notionhq/client";
import { InputPropertyValueMap } from "@notionhq/client/build/src/api-endpoints";
import { NotionDb, NotionDbType, NotionServerTaskDBReponse, NotionTask, NotionTaskCreate, NotionServerSingleTaskResponse, NotionTaskUpdate } from "../types/notion";
import { toPriority } from "../utils/general";

export interface INotion {
    checkForNewTasks: (db: NotionDb) => Promise<NotionTask[]>
}



export default class Notion implements INotion {
    private client: Client;

    constructor(auth: string) {
        this.client = new Client({ auth });

    }

    // a general function that creates any NotionDbType
    private createPage(properties: InputPropertyValueMap, database_id: string) {
        return this.client.pages.create({
            parent: {
                database_id
            },
            properties
        })
    }

    async updateTask(task: NotionTaskUpdate) {
        return this.client.pages.update({
            page_id: task.id,
            properties: Notion.convertNotionTaskToSingleTaskPageProperties(task),
            archived: false,
        })
    }


    async createTask(task: NotionTaskCreate) {
        return this.createPage(Notion.convertNotionTaskToSingleTaskPageProperties(task), task.parent);
    }

    async checkForNewTasks(db: NotionDb): Promise<NotionTask[]> {
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

                            on_or_after: db.lastRecentDate.toDate().toISOString(),

                        }
                    }
                ]
            }
        }) as NotionServerTaskDBReponse;

        return database.results.map(
            page => Notion.convertNotionTaskPageToNotionTask(page, db)
        ).filter(({ last_edited }) => !last_edited || last_edited >= db.lastRecentDate.toDate())

    }


    // todo refactor this please :( !
    static convertSingleTaskPageResponseToNotionTask(task: NotionServerSingleTaskResponse, parent: string): NotionTask {
        return ({
            id: task.id,
            parent,
            title: task.properties.title.title.map(t => t.plain_text).join(" "),
            done: task.properties.done.checkbox,
            labels: task.properties.labels.multi_select.map(s => s.name as string),
            priority: task.properties.priority?.select.name
                ? toPriority(task.properties.priority.select.name) : undefined,
            last_edited: new Date(task.properties.last_edited.last_edited_time),
            section: task.properties.section?.select.name
        })
    }

    // todo is Task a type of NotionTask or NotionTaskUpdate
    static convertNotionTaskToSingleTaskPageProperties(task: Partial<NotionTask>) {

        type NotionTaskProperities = keyof NotionTask;
        const properties: InputPropertyValueMap = {};

        const taskPropertyNames = Object.keys(task) as NotionTaskProperities[];
        taskPropertyNames.forEach(key => {
            if (key == "title")
                properties[key] = {
                    type: "title",
                    title: [
                        {
                            type: "text",
                            text: { content: task.title as string },
                        },
                    ],
                }
            else if (key == "labels")
                properties[key] = {
                    type: "multi_select",
                    multi_select: (task.labels as string[]).map(l => ({ name: l }))
                }
            else if (key == "priority")
                properties[key] = {
                    type: "select",
                    select: { name: task.priority as string }
                }
            else if (key == "section")
                properties[key] = {
                    type: "select",
                    select: { name: task.section as string }
                }
            else if (key == "done")
                properties[key] = {
                    type: "checkbox",
                    checkbox: task.done as boolean
                }
        })
        return properties;
    }
}

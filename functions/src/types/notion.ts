import { Page, PaginatedList, TitlePropertyValue, RichTextPropertyValue, NumberPropertyValue, SelectPropertyValue, MultiSelectPropertyValue, DatePropertyValue, FormulaPropertyValue, RollupPropertyValue, PeoplePropertyValue, FilesPropertyValue, CheckboxPropertyValue, URLPropertyValue, EmailPropertyValue, PhoneNumberPropertyValue, CreatedTimePropertyValue, CreatedByPropertyValue, LastEditedTimePropertyValue, LastEditedByPropertyValue } from "@notionhq/client/build/src/api-types";
import { Priority } from "./task";

export enum NotionDbType {
    TASK = "task",
    POMODORO = "pomodoro",
    THOUGHT = "thought",
}

export type NotionDb = {
    id: string;
    type: NotionDbType
    lastRecentDate: Date;
}


export interface NotionTask {
    id: string,
    parent: string,
    title: string,
    priority?: Priority,
    section?: string,
    labels: string[],
    done: boolean,
    last_edited?: Date
}


export interface NotionTaskPage extends Page {
    properties: {
        "title": TitlePropertyValue,
        "priority": SelectPropertyValue,
        "section": SelectPropertyValue,
        "labels": MultiSelectPropertyValue,
        "done": CheckboxPropertyValue,
        "last_edited": LastEditedTimePropertyValue,
    };
}

export type NotionUpdateTaskPage = Omit<NotionTaskPage, "properties"> & { properties: Partial<NotionTaskPage["properties"]> }

export interface NotionServerTaskDBReponse extends PaginatedList<NotionTaskPage> { }

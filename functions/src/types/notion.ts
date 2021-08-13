import { InputPropertyValueMap } from "@notionhq/client/build/src/api-endpoints";
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
    lastRecentDate: FirebaseFirestore.Timestamp;
}


export interface NotionTask {
    id: string,
    parent: string,
    title: string,
    priority?: Priority,
    section?: string,
    labels: string[],
    done: boolean,
    last_edited: Date
}


export interface NotionTaskUpdate {
    id: string;
    title?: string;
    priority?: Priority;
    section?: string;
    labels?: string[];
    done?: boolean;
}


export interface NotionTaskCreate {
    parent: string,
    title: string,
    priority?: Priority,
    section?: string,
    labels?: string[],
    done: boolean,
}


/// Notion API related ↓


export type NotionTaskPageProperities = {
    title: TitlePropertyValue,
    priority: SelectPropertyValue,
    section: SelectPropertyValue,
    labels: MultiSelectPropertyValue,
    done: CheckboxPropertyValue,
    last_edited: LastEditedTimePropertyValue,
}

// NotionAPI returns the Page type!
export interface NotionServerSingleTaskResponse extends Page {
    properties: NotionTaskPageProperities
}


export interface NotionServerTaskDBReponse extends PaginatedList<NotionServerSingleTaskResponse> { }

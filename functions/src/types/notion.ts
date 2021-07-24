import { Page, PaginatedList, TitlePropertyValue, RichTextPropertyValue, NumberPropertyValue, SelectPropertyValue, MultiSelectPropertyValue, DatePropertyValue, FormulaPropertyValue, RollupPropertyValue, PeoplePropertyValue, FilesPropertyValue, CheckboxPropertyValue, URLPropertyValue, EmailPropertyValue, PhoneNumberPropertyValue, CreatedTimePropertyValue, CreatedByPropertyValue, LastEditedTimePropertyValue, LastEditedByPropertyValue } from "@notionhq/client/build/src/api-types";

export enum NotionDbType {
    TASK = "task",
    POMODORO = "pomodoro",
}

export type NotionDb = {
    id: string;
    type: NotionDbType
    lastRecentDate: Date;
}


// todo enforce this schema on Task database
export type NotionTaskDBProperities = keyof NotionTaskPage["properties"]
export interface NotionTaskPage extends Page {
    properties: {
        "title": TitlePropertyValue,
        "priority": SelectPropertyValue,
        "section": SelectPropertyValue,
        "labels": MultiSelectPropertyValue,
        "done": CheckboxPropertyValue,
        "last_edited": LastEditedByPropertyValue,
    };
}

export interface NotionServerTaskDBReponse extends PaginatedList<NotionTaskPage> { }



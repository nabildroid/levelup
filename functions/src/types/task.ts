
export enum Priority {
    P1 = "P1", P2 = "P2", P3 = "P3", P4 = "P4",
}


type NotionID = string;
type TodoistID = string;

/**
 * Notion ID composed with Todoist ID
 */
export type NTID = [string, string?];

// the only data that circulate within the pubsub 
export interface Task {
    parent: NTID, // composed ID (notion_todoist)
    id: NTID, // composed ID (notion_todoist)
    title: string, 
    descrption?: string,
    priority?: Priority,
    labels: string[],
    section?: string,
    done: boolean,
}

/**
 * minimal information that are stored in DB to indicate whether a task is completd or not (document doesn't exists), because we need to know if the new update that happened in isNotionUpdated is just an properities update or a task got completed
 * storing the enite task is data lost since the task circulate within the pubsub
 * insterted into firestore by ValidateTask service
 * @attribute id an array that contains at max two ids
 * @attribute user user id https://www.notion.so/laknabil/do-i-really-need-to-store-the-entire-task-information-600c939da1884ccab583e1c65c8a47d2#9bfa000763944b0dac0a33287ddfa2ce
 */

export interface CompleteTask{
    id:NTID,
    user:string,
}

/**
 * used to update Todoist if update comes from Notion or vice versa
 * https://www.notion.so/laknabil/how-to-get-the-part-B-of-Task-id-when-we-extract-Task-from-notion-in-isNotionUpdated-04a39348d10049c2a0de26bbc75696d3
 */
export interface TaskAssociation {
    id:NTID
}
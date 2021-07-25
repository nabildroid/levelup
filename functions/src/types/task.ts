
export enum Priority {
    P1 = "P1", P2 = "P2", P3 = "P3", P4 = "P4",
}

// the only data that circulate within the pubsub 
export interface Task {
    parent: string, // composed ID (notion_todoist)
    id: string, // composed ID (notion_todoist)
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
 * @attribute id a composted ID (TodoistID&NotionID)
 * @attribute user user id
 */

export interface CompleteTask{
    id:string,
    user:string,
}
export enum Priority {
    P1 = "P1",
    P2 = "P2",
    P3 = "P3",
    P4 = "P4",
}

/**
 * Notion ID composed with Todoist ID
 */
export type NTID = [string, string?];

// the only data that circulate within the pubsub
export interface Task {
    parent: NTID; // composed ID (notion_todoist)
    id: NTID; // composed ID (notion_todoist)
    title: string;
    descrption?: string;
    priority?: Priority;
    labels: (string | number)[];
    section?: string;
    done: boolean;
}

export interface NewTask {
    parent: NTID; // composed ID (notion_todoist)
    id: NTID; // required because a Task first got created by either Notion or Todoist and we need to sync that with the other service
    title: string;
    descrption?: string;
    priority?: Priority;
    labels?: (string | number)[];
    section?: string;
}

export interface UpdateTask {
    id: [string, string];
    title?: string;
    descrption?: string;
    priority?: Priority;
    labels?: (string | number)[];
    section?: string;
    done?: boolean;
}

/**
 * minimal information that are stored in DB to indicate whether a task is completd or not, because we need to know if the new update that happened in isNotionUpdated is just an properities update or a task got completed, or new task
 * storing the enite task is data lost since the task circulate within the pubsub
 * insterted into firestore by ValidateTask service
 * @attribute id an array that contains at max two ids
 * @attribute user user id https://www.notion.so/laknabil/do-i-really-need-to-store-the-entire-task-information-600c939da1884ccab583e1c65c8a47d2#9bfa000763944b0dac0a33287ddfa2ce
 */

export interface StoredTask {
    id: NTID;
    user: string;
    completed: boolean
}
export enum PubsubInsertedSource {
    Notion = "notion",
    Todoist = "todoist"
}

export type PubsubInsertTaskAttributes = {
    source: PubsubInsertedSource
}

export type PubsubDetectedEventTypeAttributes = {
    type: "new" | "update" | "complete",
    source: PubsubInsertedSource,
}

export type PubsubValidateTaskAttributes = {
    source: PubsubInsertedSource,
}
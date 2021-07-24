export enum PubsubNewUpdateSource {
    Notion = "notion",
    Todoist = "todoist"
}

export type PubsubPublishUpdateAttribute = {
    from: PubsubNewUpdateSource
}
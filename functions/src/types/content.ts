enum SourceType {
    POCKET,
    NOTION,
    KEEP,
    TWITTER,
}

interface Content {
    id: string;
    data: string;
    sourceType: SourceType;
    sourceLink: string;
    tags?: string[];
    created: String;
}

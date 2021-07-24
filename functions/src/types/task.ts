
enum Priority {
    P1, P2, P3
}

interface Task {
    parent: string,
    id: string,
    title: string,
    descrption: string,
    priority?: Priority,
    labels: string[],
    section?: string,
    done: boolean,
}
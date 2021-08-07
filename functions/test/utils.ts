import { NTID, Task } from "../src/types/task";

export const fromNow = (mins = 0) => new Date(Date.now() + (mins * 60) * 1000);

export const getEventByID = (events: { data: any, attributes: any }[], id: string) => {

    return events.find(e => {
        const data = JSON.parse(Buffer.from(e.data).toString()) as Task | NTID;
        if (data instanceof Array) {
            return data.includes(id);
        } else {
            return data.id.includes(id);
        }
    }) as { data: any, attributes: any }
}

export const pause = (seconds = 1) => {
    return new Promise((res) => {
        setTimeout(res, seconds * 1000);
    })
}

export const randomNotionID = () => {
    const r = Math.random().toString().slice(3, 8);
    return `589d997030${r}ea3b6c2202ded599dd2`;
}

export const randomTodoistID = () => {
    return Math.floor(Math.random() * 10000000).toString();
}
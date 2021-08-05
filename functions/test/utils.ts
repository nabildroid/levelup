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
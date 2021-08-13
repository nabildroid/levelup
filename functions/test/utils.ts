import { NTID, Task } from "../src/types/task";
import { firestore } from "firebase-admin";


export const fromNow = (mins = 0) => firestore.Timestamp.fromDate(
    new Date(Date.now() + (mins * 60) * 1000)
);


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

export const pause = async (seconds = 1) => new Promise(res =>
    setTimeout(res, seconds * 1000)
);
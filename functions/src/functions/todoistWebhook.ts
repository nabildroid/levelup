import * as functions from "firebase-functions";
import { TodoistWebhook } from "../types/todoist";




export default functions.https.onRequest(async (req, res) => {

    const data = req.body as TodoistWebhook;

    console.log(data.event_data.content);

    res.send("done");
});

import { Topic } from "@google-cloud/pubsub";
import PubSubConnector from "../connectors/pubsub";

export default class PubsubSubscriber {
    private client: PubSubConnector;
    private subscriptions: (() => Promise<any>)[] = [];
    constructor(client: PubSubConnector) {
        this.client = client;
    }


    private async createSubscription(topic: Topic): Promise<{ data: any, attributes: any }> {
        const name = "a" + Math.random().toString().slice(2);

        const [sub] = await topic.createSubscription(name);

        this.subscriptions.push(() =>
            topic.subscription(name).delete()
        );


        return new Promise((res, rej) => {

            const stoping = setTimeout(()=>rej("timeout"),5000);

            sub.on("message", async (msg) => {
                clearTimeout(stoping);
                await msg.ack();
                return res(msg);
            });


            sub.on("error", async (err) => {
                clearTimeout(stoping);

                return rej(err);
            })

        })


    }

    isNotionUpdated() {
        return this.createSubscription(
            this.client.getTopic("INSERT_TASK"),
        )
    }

    findWhere() {
        return this.createSubscription(
            this.client.getTopic("DETECTED_TASK_EVENT"),
        )
    }

    async clear() {
        await Promise.all(this.subscriptions.map(s => s()));

    }
}
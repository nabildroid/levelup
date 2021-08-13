import { CreateSubscriptionOptions, Topic } from "@google-cloud/pubsub";
import PubSubConnector from "../connectors/pubsub";

export default class PubsubSubscriber {
    client: PubSubConnector;
    private subscriptions: (() => Promise<any>)[] = [];
    constructor(client: PubSubConnector) {
        this.client = client;
    }


    // todo refactor this function
    private async createShortPeriodSubscription(topic: Topic, period = 8000, options?: CreateSubscriptionOptions): Promise<{ data: any, attributes: any }[]> {
        const name = topic.name.split("/").pop() + Math.random().toString().slice(2, 5);

        const [sub] = await topic.createSubscription(name, options);
        await sub.seek(new Date());

        this.subscriptions.push(() =>
            topic.subscription(name).delete()
        );


        return new Promise((res, rej) => {
            const messages: { data: any, attributes: any }[] = [];

            const stoping = setTimeout(() => {
                if (!messages.length)
                    rej("timeout")
                else res(messages);
            }, period);

            sub.on("message", async (msg) => {
                await msg.ack();
                messages.push(msg);
            });


            sub.on("error", async (err) => {
                clearTimeout(stoping);

                return rej(err);
            })

        })

    }

    private async createSubscription(topic: Topic, options?: CreateSubscriptionOptions): Promise<{ data: any, attributes: any }> {
        const name = "a" + Math.random().toString().slice(2);

        const [sub] = await topic.createSubscription(name, options);

        await sub.seek(new Date());
        this.subscriptions.push(() =>
            topic.subscription(name).delete()
        );


        return new Promise((res, rej) => {

            const stoping = setTimeout(() => rej("timeout"), 5000);

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
        // findWhere should emit this event
        return this.createShortPeriodSubscription(
            this.client.getTopic("DETECTED_TASK_EVENT"),
        )
    }

    private async attachToEndPoint(topic: Topic, pushEndpoint: string, filter?: string) {
        const name = "a" + Math.random().toString().slice(2);

        const [sub] = await topic.createSubscription(name, {
            pushEndpoint,
            filter
        });
        await sub.seek(new Date());
        const detatch = async () => await topic.subscription(name).delete();
        this.subscriptions.push(detatch);
        return detatch;
    }

    attatchUpdateNotion(pushEndpoint: string) {
        return this.attachToEndPoint(
            this.client.getTopic("DETECTED_TASK_EVENT"),
            pushEndpoint,
            "attributes.source != \"notion\" OR attributes.type = \"uncomplete\""
        )
    }

    attatchUpdateTodoist(pushEndpoint: string) {
        return this.attachToEndPoint(
            this.client.getTopic("DETECTED_TASK_EVENT"),
            pushEndpoint,
            "attributes.source != \"todoist\" OR attributes.type = \"uncomplete\""
        )
    }

    async clear() {
        await Promise.all(this.subscriptions.map(s => s()));

    }
}
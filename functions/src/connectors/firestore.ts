import { NTID, StoredTask } from "../types/task";
import { User } from "../types/user";
import { nestedArrayToObject, objectToNestedArray } from "../utils/general";
import isDev from "../utils/isDev";

const users: { [key: string]: User } = {};

export default class FirestoreConnector {
    private _client!: FirebaseFirestore.Firestore;
    private isReady = false;
    private init: () => FirebaseFirestore.Firestore;

    constructor(init: () => FirebaseFirestore.Firestore) {
        this.init = init;
    }

    private get client() {
        if (!this.isReady) {
            this._client = this.init();
            this.isReady = true;
        }
        return this._client;
    }
    async lazyLoadUser(user: string): Promise<User> {
        if (users[user]) return Promise.resolve(users[user]);
        else {
            const docRef = this.client.doc(
                `users/${user}`
            ) as FirebaseFirestore.DocumentReference<
                Omit<User, "todoistProjects"> & {
                    todoistProjects: { [key: number]: NTID[] };
                }
            >;

            const doc = await docRef.get();
            const data = doc.data();
            if (data) {
                return Promise.resolve({
                    auth: data.auth,
                    notionDB: data.notionDB.map((db) => ({
                        ...db,
                        lastRecentDate: db.lastRecentDate,
                    })),
                    todoistLabel: data.todoistLabel,
                    todoistProjects: objectToNestedArray(data.todoistProjects),
                });
            }

            throw Error("undefined user " + user);
        }
    }

    async getStoredTask(id: NTID): Promise<StoredTask | undefined> {
        const ref = this.client
            .collection("/tasks")
            .where("id", "array-contains-any", id)
            .limit(1);
        const query = await ref.get();

        return query.docs[0]?.data() as StoredTask;
    }

    async saveNewTask(id: [string, string], user: string) {
        const task: StoredTask = {
            id,
            user,
            completed: false,
        };
        console.log(task);

        await this.client.collection("/tasks").add(task);
    }

    async createUser(user: User) {
        await this.client.doc(`/users/nabil`).set({
            ...user,
            notionDB: user.notionDB.map((db) => ({
                ...db,
                lastRecentDate: db.lastRecentDate,
            })),
            todoistProjects: nestedArrayToObject(user.todoistProjects),
        });
    }

    async clear() {
        if (isDev()) {
            await this.client
                .collection("/users")
                .get()
                .then(async (docs) => {
                    await Promise.all(docs.docs.map((doc) => doc.ref.delete()));
                });
            await this.client
                .collection("/tasks")
                .get()
                .then(async (docs) => {
                    await Promise.all(docs.docs.map((doc) => doc.ref.delete()));
                });
        }
    }
}

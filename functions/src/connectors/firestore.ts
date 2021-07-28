import { NTID, StoredTask } from "../types/task";
import { User } from "../types/user";
import { nestedArrayToObject, objectToNestedArray } from "../utils/general";
import isDev from "../utils/isDev";

const users: { [key: string]: User } = {};

export default class FirestoreConnector {
    private client: FirebaseFirestore.Firestore;

    constructor(firestore: FirebaseFirestore.Firestore) {
        this.client = firestore;
    }


    async lazyLoadUser(user: string): Promise<User> {
        if (users[user]) return Promise.resolve(users[user]);
        else {
            const docRef = this.client.doc(`users/${user}`) as FirebaseFirestore.DocumentReference<(Omit<User, "todoistProjects"> & { todoistProjects: { [key: number]: NTID[] } })>;

            const doc = await docRef.get();
            const data = doc.data();
            if (data) {
                return Promise.resolve({
                    auth: data.auth,
                    notionDB: data.notionDB.map((db) => ({
                        ...db,
                        lastRecentDate: new Date(db.lastRecentDate)
                    })),
                    todoistLabel: data.todoistLabel,
                    todoistProjects: objectToNestedArray(data.todoistProjects)
                });
            }

            throw Error("undefined user " + user);
        }
    }

    async getStoredTask(id: NTID): Promise<StoredTask | undefined> {
        const ref = this.client.collection("/tasks")
            .where("id", "array-contains-any", id).limit(1);
        const query = await ref.get();

        return query.docs[0]?.data() as StoredTask;
    }

    async saveNewTask(id: NTID, user: string) {
        const task: StoredTask = {
            id, user,
            completed: false
        }

        await this.client.collection("/tasks").add(task);
    }


    async createUser(user: User) {
        await this.client.doc(`/users/nabil`).set({
            ...user,
            notionDB: user.notionDB.map((db) => ({
                ...db,
                lastRecentDate: db.lastRecentDate.toISOString(),
            })),
            todoistProjects: nestedArrayToObject(user.todoistProjects)
        });
    }

    async clear(){
        if(isDev()){
            this.client.collection("users").get().then((docs)=>{
                docs.forEach(doc=>doc.ref.delete());
            })
            this.client.collection("tasks").get().then((docs)=>{
                docs.forEach(doc=>doc.ref.delete());
            })
        }
    }

}
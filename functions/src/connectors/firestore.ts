import { firestore } from "..";
import { NTID, StoredTask } from "../types/task";
import { User } from "../types/user";

const users: { [key: string]: User } = {};

export default class Firestore {
    static lazyLoadUser = async (user: string): Promise<User> => {
        if (users[user]) return Promise.resolve(users[user]);
        else {
            const docRef = firestore.doc(`users/${user}`) as FirebaseFirestore.DocumentReference<User>;

            const doc = await docRef.get();
            const data = doc.data();
            if (data) {
                return Promise.resolve({
                    auth: data.auth,
                    notionDB: data.notionDB.map(({ id, type, lastRecentDate }) => ({
                        id, type,
                        lastRecentDate: new Date(lastRecentDate)
                    })),
                    todoistLabel: data.todoistLabel,
                    todoistProjects: data.todoistProjects
                });
            }
            throw Error("undefined user " + user);
        }
    }

    static getStoredTask = async (id: NTID): Promise<StoredTask | undefined> => {
        const ref = firestore.collection("/tasks")
            .where("id", "array-contains-any", id).limit(1);
        const query = await ref.get();

        return query.docs[0]?.data() as StoredTask;
    }

    static saveNewTask = async (id: NTID, user: string) => {
        const task: StoredTask = {
            id, user,
            completed: false
        }
        
        firestore.collection("/tasks").add(task);
    }
}
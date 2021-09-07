import { User } from "../types/user";
import Notion from "../connectors/notion";
import { ITaskRepository, NewTask, Task, UpdateTask } from "../types/task";
import { NotionDbType } from "../types/notion";


export default class NotionTaskAdapter extends Notion implements ITaskRepository {
    readonly user: User;
    constructor(user: User) {
        super(user.auth.notion);

        this.user = user;
    }

    async create(newTask: NewTask): Promise<Task> {
        const notionTask = await super.createTask({
            done: false,
            parent: newTask.parent[0],
            title: newTask.title,
        });

        return {
            ...newTask,
            done: false,
            id: [notionTask.id],
        }
    }
    async update(updatedTask: UpdateTask): Promise<boolean> {
        return !!(await super.updateTask({
            ...updatedTask,
            id: updatedTask.id[0],

        })).id;
    }

    async fetch(parent: string, lastRecentDate: FirebaseFirestore.Timestamp): Promise<Task[]> {
        const notionTasks = await super.checkForNewTasks({
            id: parent,
            lastRecentDate: lastRecentDate,
            type: NotionDbType.TASK,
        });

        return notionTasks.map(nt => ({
            ...nt,
        }));

    }

    async close(id: string): Promise<boolean> {
        return !!(await this.updateTask({
            id,
            done: true,
        })).id
    }
    async reopen(id: string): Promise<boolean> {
        return !!(await this.updateTask({
            id,
            done: false,
        })).id
    }

}
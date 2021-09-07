import { User } from "../types/user";
import Todoist from "../connectors/todoist";
import { ITaskRepository, NewTask, Task, UpdateTask } from "../types/task";
import { fromPriority } from "../utils/general";


export default class NotionTaskAdapter extends Todoist implements ITaskRepository {
    readonly user: User;
    constructor(user: User) {
        super(user.auth.notion);

        this.user = user;
    }

    async create(newTask: NewTask): Promise<Task> {
        const todoistTask = await super.createTask({
            ...newTask,
            project_id: newTask.parent[0],

            content: newTask.title,
            priority: fromPriority(newTask.priority)
        });

        return {
            ...newTask,
            done: false,
            id: [notionTask.id],
        }
    }
    async update(updatedTask: UpdateTask): Promise<boolean> {
        return await super.updateTask({

            ...updatedTask,
            id: updatedTask.id[0],

        });
    }

    async fetch(parent: string, lastRecentDate: FirebaseFirestore.Timestamp): Promise<Task[]> {
        const todoistTasks = await super.checkForNewTask(lastRecentDate.toDate());

        // todo filter parents
        return todoistTasks.map(tt => ({
            ...tt,
        }));

    }

    async close(id: string): Promise<boolean> {
        return super.closeTask(id);
    }
    async reopen(id: string): Promise<boolean> {
        return super.reopenTask(id);
    }
}
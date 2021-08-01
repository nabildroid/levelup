import axios, { AxiosInstance } from "axios";
import { TodoistNewTask, TodoistTask } from "../types/todoist";

export default class TodoistConnector {

    private client!: AxiosInstance;

    constructor(token: string) {
        this.client = axios.create({
            baseURL: "https://api.todoist.com/rest/v1",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }


    async createTask(task: TodoistNewTask): Promise<TodoistTask> {
        const { data } = await this.client.post("/tasks", {
            ...task,
            label_ids: task.labels
        })
        return {
            ...data as TodoistTask,
            labels: data.label_ids as number[]
        }

    }

    async updateTask(task: Partial<TodoistNewTask> & { id: number }) {
        const path = `/tasks/${task.id}`;
        const data = Object.assign({
            ...task,

        }, task.labels ? { label_ids: task.labels } : {});

        const response = await this.client.post(path, data);

        return response.status == 204;
    }

    async closeTask(id: number) {
        const path = `/tasks/${id}/close`;
        const response = await this.client.post(path);

        return response.status == 204;
    }

    async reopenTask(id: number) {
        const path = `/tasks/${id}/reopen`;
        const response = await this.client.post(path);

        return response.status == 204;
    }

    async getAllLabels() {
        const { data } = await this.client.get("/labels");
        return data as { id: number, name: string }[]
    }

    async createLabel(name: string) {
        const { data } = await this.client.post("/labels", { name });

        return data as { id: number, name: string };
    }
}
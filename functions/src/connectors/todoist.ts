import axios, { AxiosInstance } from "axios";
import { TodoistNewTask, TodoistTask, TodoistTaskUpdate } from "../types/todoist";
import { dateAcceptedByTodoist } from "../utils/todoistUtils";

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

    // todo refactor this shit !
    async checkForNewTask(lastRecentDate: Date): Promise<TodoistTask[]> {
        const params = {
            // todo the filter not working 
            // filter: "created after:  " + dateAcceptedByTodoist(lastRecentDate),
        };
        const { data } = await this.client.get("/tasks", {
            params
        }) as { data: TodoistTask[] };

        return data.map(d => ({
            ...d,
            id: d.id.toString(),
            project_id: d.project_id.toString(),
            label_ids: d.labels
        }))
    }


    async createTask(task: TodoistNewTask): Promise<TodoistTask> {
        const response = await this.client.post("/tasks", {
            ...task,
            label_ids: task.labels
        })

        const data = response.data as TodoistTask;

        return {
            ...data,
            id: data.id.toString(),
            project_id: data.project_id.toString(),
            labels: response.data.label_ids as number[]
        }

    }

    async updateTask(task: TodoistTaskUpdate) {
        const path = `/tasks/${task.id}`;
        const data = Object.assign({
            ...task,
            id: task.id.toString()
        },
            task.labels ? { label_ids: task.labels } : {},
            task.project_id ? { project_id: task.project_id.toString() } : {},
        );

        const response = await this.client.post(path, data);

        return response.status == 204;
    }

    async closeTask(id: string) {
        const path = `/tasks/${id}/close`;
        const response = await this.client.post(path);

        return response.status == 204;
    }

    async reopenTask(id: string) {
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
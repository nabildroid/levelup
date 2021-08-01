import { TODOIST_TOKEN } from ".";
import TodoistConnector from "../src/connectors/todoist";
import { Priority } from "../src/types/task";
import { fromPriority } from "../src/utils/general";


const todoist = new TodoistConnector(TODOIST_TOKEN);




it.only("creates a new todoist task", async () => {
    const randomTitle = Math.random().toString();
    const task = await todoist.createTask({
        content: randomTitle,
        labels: [],
        priority: fromPriority(Priority.P2),
    });

    expect(task.checked).toBeFalsy();
    expect(task.content).toEqual(randomTitle);
    expect(task.labels).toHaveLength(0);
    expect(task.priority).toEqual(fromPriority(Priority.P2));
    expect(task.section_id).toBeFalsy();

    expect.setState({ id: task.id });
});

it.only("updates a task", async () => {
    const randomTitle = Math.random().toString();

    await expect(todoist.updateTask({
        id: expect.getState().id,
        content: randomTitle,
        priority: fromPriority(Priority.P3)
    })).resolves.toBeTruthy();
});

it.only("mark a task as completed",async()=>{
    await expect(todoist.closeTask(expect.getState().id)).toBeTruthy();
})

it.only("mark a task as uncompleted",async()=>{
    await expect(todoist.reopenTask(expect.getState().id)).toBeTruthy();
})
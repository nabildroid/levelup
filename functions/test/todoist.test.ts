import { TODOIST_TOKEN } from ".";
import TodoistConnector from "../src/connectors/todoist";
import { Priority } from "../src/types/task";
import { fromPriority } from "../src/utils/general";
import { fromNow } from "./utils";


const todoist = new TodoistConnector(TODOIST_TOKEN);


it("creates a new todoist task", async () => {
    const randomTitle = Math.random().toString();
    const task = await todoist.createTask({
        content: randomTitle,
        priority: fromPriority(Priority.P2),
    });

    expect(task.checked).toBeFalsy();
    expect(task.content).toEqual(randomTitle);
    expect(task.labels).toHaveLength(0);
    expect(task.priority).toEqual(fromPriority(Priority.P2));
    expect(task.section_id).toBeFalsy();

    expect.setState({ id: task.id });
});


it("checkes for new Tasks",async ()=>{
    const pages =await todoist.checkForNewTask(fromNow());

    const prevTaskExists = pages.some(pages=>pages.id == expect.getState().id);

    expect(prevTaskExists).toBeTruthy();
});

it("updates a task", async () => {
    const randomTitle = Math.random().toString();

    await expect(todoist.updateTask({
        id: expect.getState().id,
        content: randomTitle,
        priority: fromPriority(Priority.P3)
    })).resolves.toBeTruthy();
});

it("marks a task as completed", async () => {
    await expect(todoist.closeTask(expect.getState().id)).toBeTruthy();
})

it("marks a task as uncompleted", async () => {
    await expect(todoist.reopenTask(expect.getState().id)).toBeTruthy();
})

it("creates a new label", async () => {
    const labels = [Math.random().toString(), Math.random().toString()];


    expect(await todoist.createLabel(labels[0])).resolves;
    expect(await todoist.createLabel(labels[1])).resolves;

    expect.setState({ labels });
})

it("gets all labels", async () => {
    const { labels } = expect.getState();

    const fetchedLables = (await todoist.getAllLabels()).map(p => p.name);

    expect(fetchedLables).toContainEqual(labels[0]);
    expect(fetchedLables).toContainEqual(labels[1]);
})
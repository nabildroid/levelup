import { User } from "../types/user";





export const translateTodoistLabels = (
    user: User,
    labels: string[]
) => {
    return Object.entries(user.todoistLabel)
        .map(([key, value]) => {
            if (labels.includes(key)) return value;
            if (labels.includes(value)) return key;
        })
        .filter((v) => v) as string[];
};
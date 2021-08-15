enum RewardType {
    TASK_DONE,
    TASK_CREATED,
    TASK_PLANNING,
    INSTANT_DOSE,
    ONE_POMODORO,
}

interface Reward {
    id: string;
    value: number;
    type: RewardType;
    message: string;
    created: Date;
}

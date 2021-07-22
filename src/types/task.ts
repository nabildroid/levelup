
enum Priority {
    P1, P2, P3
}

interface Task {
    id:string,
    title:string,
    descrption:string,
    priority?:Priority
    subProject?:string,
    done:boolean,
    pomodoros?:number,
    created:Date;
}
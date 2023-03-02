import { Project, ProjectStatus } from "../models/project";

// Project State Management
type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addlistener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

export class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super();
    }

    static getInstance() {
        if (this.instance) return this.instance
        return this.instance = new ProjectState;
    }

    addProject(title: string, description: string, people: number) {
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            people,
            ProjectStatus.Active
        )
        this.projects.push(newProject);
        this.updateListenesrs();
    }

    moveProject(projectId: string, newStatus: ProjectStatus) {
        const project = this.projects.find(prj => prj.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListenesrs();
        }
    }

    private updateListenesrs() {
        this.listeners.forEach(listenerFn => {
            listenerFn([...this.projects]);
        });
    }
}
export const projectState = ProjectState.getInstance();
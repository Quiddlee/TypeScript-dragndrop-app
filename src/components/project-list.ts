import { DragTarget } from '../models/drag-drop';
import { Project, ProjectStatus } from "../models/project";
import Component from "./base-component";
import { BindThis } from "../decorators/autobind";
import { projectState } from "../state/project-state";
import { ProjectItem } from "./project-item";

// ProjectList Class
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false, `${type}-projects`);
        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    @BindThis
    dragLeaveHandler(_: DragEvent): void {
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.remove('droppable');
    }

    @BindThis
    dropHandler(event: DragEvent): void {
        const prjId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(
            prjId,
            this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
        );
    }

    @BindThis
    dragOverHandler(event: DragEvent): void {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable');
        }
    }

    protected configure(): void {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);

        projectState.addlistener((projects: Project[]) => {
            const relevantProjects = projects.filter(prj => {
                if (this.type === 'active') {
                    return prj.status === ProjectStatus.Active;
                }

                return prj.status === ProjectStatus.Finished;
            });

            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });

    }

    protected renderProjects() {
        const listEl = document.querySelector(`#${this.type}-projects-list`) as HTMLUListElement;
        listEl.innerHTML = '';
        this.assignedProjects.forEach(project => {
            new ProjectItem(this.element.querySelector('ul')!.id, project);
        });
    }

    protected renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
}

// Project Type
enum ProjectStatus { Active, Finished }

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {}
}

// Project State Management
type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];
    
    addlistener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

class ProjectState extends State<Project> {
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
        this.listeners.forEach(func => func([...this.projects]));
    }
}
const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate({
    value,
    required,
    minLength,
    maxLength,
    min,
    max,
}: Validatable) {
    let isValid = true;

    if (required) {
        isValid = isValid && value.toString().trim().length !== 0;
    }

    if (minLength != null && typeof value === 'string') {
        isValid = isValid && value.length >= minLength;
    }

    if (maxLength != null && typeof value === 'string') {
        isValid = isValid && value.length <= maxLength;
    }

    if (min != null && typeof value === 'number') {
        isValid = isValid && value >= min;
    }

    if (max != null && typeof value === 'number') {
        isValid = isValid && value <= max;
    }

    return isValid;
}

// BindThis decorator
function BindThis (_: any, _2: string, descriptor: PropertyDescriptor) {
    return {
        configurable: true,
        enumerable: false,
        get() {
            return descriptor.value.bind(this);
        }
    }
}

// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(
        templateId: string,
        hostElementId: string,
        insertAtStart: boolean,
        newElementId?: string,
    ) {
        this.templateElement = document.querySelector(`#${templateId}`) as HTMLTemplateElement;
        this.hostElement = document.querySelector(`#${hostElementId}`) as T;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;
        if (newElementId) {
            this.element.id = newElementId;  
        }

        this.attach(insertAtStart);
    }

    private attach(insertAtBeginning: boolean) {
        this.hostElement.insertAdjacentElement(
            insertAtBeginning ? 'afterbegin'
            : 'beforeend', this.element
        );
    }

    protected abstract configure?(): void;
    protected abstract renderContent(): void;
}


// ProjectItem class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> {
    private project: Project;

    get persons() {
        if (this.project.people === 1) {
            return '1 person';
        }
        else {
            return `${this.project.people} persons`;
        }
    }

    constructor(hostId: string, project: Project) {
        super('single-project', hostId, false, project.id);
        this.project = project;

        this.configure();
        this.renderContent();
    }

    protected configure(): void {}

    protected renderContent(): void {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = `${this.persons} assigned.`;
        this.element.querySelector('p')!.textContent = this.project.description;
    }
}

// ProjectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false, `${type}-projects`);
        this.assignedProjects = []; 

        this.configure();
        this.renderContent();
    }

    protected configure(): void {
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

// ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;
    
    constructor() {
        super('project-input', 'app', true, 'user-input');
        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
    }

    private gatherUserInput(): [string, string, number] | void {
        const inputs = [
            this.titleInputElement,
            this.descriptionInputElement,
            this.peopleInputElement,
        ]
        .map(input => input.value.trim()); 

        const titleValidatable: Validatable = {
            value: inputs[0],
            required: true,
        };

        const descriptionValidatable: Validatable = {
            value: inputs[1],
            required: true,
            minLength: 5
        }; 

        const peopleValidatable: Validatable = {
            value: +inputs[2],
            required: true,
            min: 1,
            max: 5
        };

        if ([
            titleValidatable,
            descriptionValidatable,
            peopleValidatable,
        ].some(input => !validate(input))) {
            return alert('Invalid input, please try again!');
        }
        else {
            return [inputs[0], inputs[1], +inputs[2]];
        }
    }

    private cleareInputs() {
        this.element.reset();
    }
    
    @BindThis
    private submitHandler (event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (userInput) {
            const [title, description, people ] = userInput;
            projectState.addProject(title, description, people);
            this.cleareInputs();
            console.log(title, description, people);
        }
    }
    
    protected configure() {        
        this.element.addEventListener('submit', this.submitHandler);
    }

    protected renderContent() {}
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
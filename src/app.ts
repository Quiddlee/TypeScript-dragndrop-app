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
type Listener = (items: Project[]) => void;

class ProjectState {
    private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static instance: ProjectState; 

    private constructor() {

    }

    static getInstance() {
        if (this.instance) return this.instance
        return this.instance = new ProjectState;
    }

    addlistener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
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
        this.listeners.forEach(func => func(...this.projects));
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

// ProjectList Class
class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {
        this.templateElement = document.querySelector('#project-list') as HTMLTemplateElement;
        this.hostElement = document.querySelector('#app') as HTMLDivElement;
        this.assignedProjects = [];
        
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`;
        
        projectState.addlistener((projects: Project[]) => {
            this.assignedProjects = projects;
            this.renderProjects();
        });

        this.attach();
        this.renderContent();
    }

    private renderProjects() {
        const listEl = document.querySelector(`#${this.type}-projects-list`) as HTMLUListElement;
        this.assignedProjects.forEach(project => {
            const listItem = document.createElement('li');
            listItem.textContent = project.title;
            listEl.appendChild(listItem);
        });
    }

    private renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
    }

    private attach() {
        this.hostElement.appendChild(this.element);
    }
}

// ProjectInput Class
class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    elementForm: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;
    
    constructor() {
        this.templateElement = document.querySelector('#project-input') as HTMLTemplateElement;
        this.hostElement = document.querySelector('#app') as HTMLDivElement;
        
        const importedNode = document.importNode(this.templateElement.content, true);
        this.elementForm = importedNode.firstElementChild as HTMLFormElement;
        this.elementForm.id = 'user-input';
        
        this.titleInputElement = this.elementForm.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.elementForm.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.elementForm.querySelector('#people') as HTMLInputElement;
        
        this.configure();
        this.attach();
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
        this.elementForm.reset();
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
    
    private configure() {
        this.elementForm.addEventListener('submit', this.submitHandler);
    }
    
    private attach() {
        this.hostElement.appendChild(this.elementForm);
    }
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
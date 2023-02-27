import BindThis from "./decorators";

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
        
        if (inputs.some(input => input.length === 0)) {
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
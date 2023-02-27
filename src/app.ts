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
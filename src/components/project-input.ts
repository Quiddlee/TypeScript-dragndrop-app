import Component from "./base-component";
import * as Validation from "../util/validation";
import { BindThis } from "../decorators/autobind";
import { projectState } from "../state/project-state";

// ProjectInput Class
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

        const titleValidatable: Validation.Validatable = {
            value: inputs[0],
            required: true,
        };

        const descriptionValidatable: Validation.Validatable = {
            value: inputs[1],
            required: true,
            minLength: 5
        };

        const peopleValidatable: Validation.Validatable = {
            value: +inputs[2],
            required: true,
            min: 1,
            max: 5
        };

        if ([
            titleValidatable,
            descriptionValidatable,
            peopleValidatable,
        ].some(input => !Validation.validate(input))) {
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

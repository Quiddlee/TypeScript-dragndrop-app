// Component Base Class
export default abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    protected constructor(
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

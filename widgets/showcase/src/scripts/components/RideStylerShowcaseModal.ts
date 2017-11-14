namespace RideStylerShowcase {
    const modalClass = 'ridestyler-showcase-modal';
    const backdropClass = modalClass + '-backdrop';

    import Action = RideStylerShowcaseModal.Action;
    import Options = RideStylerShowcaseModal.Options;

    export class RideStylerShowcaseModal extends ComponentBase {
        /**
         * The main modal element
         */
        public component: HTMLElement;
        /**
         * The currently displayed backdrop
         */
        public backdrop: HTMLElement;
        /**
         * The parent element of the modal
         */
        private parent:Node;
        /**
         * The options that the modal was created with
         */
        protected readonly options: Options;

        constructor(showcaseInstance:RideStylerShowcaseInstance, options: Options) {
            super(showcaseInstance);

            this.options = options;

            // Create the backdrop if needed
            this.createBackdropIfNeeded();

            // Create the modal
            this.buildModal();
            
            // Modals start off hidden until shown
            this.setVisibility(false);

            // Modals are appended to the showcase container
            this.parent = showcaseInstance.container;
            this.parent.appendChild(this.component);
        }

        /**
         * Build the modal DOM structure
         */
        protected buildModal() {
            this.component = Object.assign(HTMLHelper.createElement('div', {
                className: modalClass
            }), {
                modal: this
            });

            if (this.options.full) this.component.classList.add(modalClass + '-full')

            HTMLHelper.createElement('button', {
                className: modalClass + '-close',
                appendTo: this.component
            }).addEventListener('click', () => {
                this.hide();
            });

            if (this.options.actions)
                this.buildActions(this.options.actions);
        }

        private buildActions(actions: Action[]) {
            let actionContainer = HTMLHelper.createElement('div', {
                className: modalClass + '-actions',
                appendTo: this.component
            });

            for (let action of actions) {
                let actionButton = HTMLHelper.createButton(ObjectHelper.assign<HTMLHelper.createButtonOptions>({
                    appendTo: actionContainer
                }, action));

                actionButton.addEventListener('click', () => {
                    if (typeof action.action === 'function') action.action();
                    else if (action.action === 'hide-modal') {
                        this.hide();
                    }
                });
            }
        }

        /**
         * Called when this modal is layed-out and about to transition in
         * @virtual
         */
        protected onShow() {
            this.events.trigger('modal-show', { modal: this });
        }
        /**
         * Called when this modal is visible
         * @virtual
         */
        protected onShown() {
        }
        /**
         * Called when this modal is about to transition out
         * @virtual
         */
        protected onHide() {
            this.events.trigger('modal-hide', { modal: this });
        }
        /**
         * Called when this modal is hidden
         * @virtual
         */
        protected onHidden() {
            if (this.options.removeOnHidden) {
                this.parent.removeChild(this.component);
            }
        }

        public show():RideStylerPromise {
            let promise = VisibilityHelper.show(this.component);

            this.onShow();
            promise.done(() => this.onShown());

            return promise;
        }

        public hide():RideStylerPromise {
            let promise = VisibilityHelper.hide(this.component);

            this.onHide();
            promise.done(() => this.onHidden());

            return promise;
        }

        public setVisibility(visible: boolean) {
            VisibilityHelper.setVisibility(this.component, visible);
        }

        /**
         * Creates the backdrop if needed
         */
        private createBackdropIfNeeded() {
            // If there's no previously existing backdrop create a new one
            if (!HTMLHelper.hasChildWithClass(this.showcase.container, backdropClass))
                new RideStylerShowcaseModalBackdrop(this.showcase);
        }
    }

    export class RideStylerShowcaseModalBackdrop extends ComponentBase {
        constructor(showcaseInstance:RideStylerShowcaseInstance) {
            super(showcaseInstance);

            // Create the backdrop
            this.buildBackdrop();

            // The backdrop starts off hidden
            this.setVisibility(false);

            // Append the backdrop to the showcase container
            showcaseInstance.container.appendChild(this.component);
        }

        private buildBackdrop() {
            this.component = HTMLHelper.createElementWithClass('div', backdropClass);

            this.component.addEventListener('click', () => {
                let topVisibleModal = HTMLHelper.lastSiblingWithClass<RideStylerShowcaseModal.ModalElement>(this.component, modalClass, 'in');

                if (topVisibleModal) {
                    topVisibleModal.modal.hide();
                }
            });
        }

        protected initializeComponent() {
            this.events.on('modal-show', event => {
                this.update();
            });

            this.events.on('modal-hide', event => {
                this.update();
            });
        }

        /**
         * Hide or show the backdrop based off the number of visible modals
         */
        private update() {
            let hasVisibleModal:boolean = HTMLHelper.hasSiblingWithClass(this.component, modalClass, 'in');

            this[hasVisibleModal ? 'show' : 'hide']();
        }

        public show():RideStylerPromise {
            return VisibilityHelper.show(this.component);
        }
        
        public hide():RideStylerPromise {
            return VisibilityHelper.hide(this.component);
        }

        public setVisibility(visible: boolean) {
            VisibilityHelper.setVisibility(this.component, visible);
        }
    }

    export namespace RideStylerShowcaseModal {
        export interface ModalElement extends HTMLElement{
            modal: RideStylerShowcaseModal
        };

        export interface Action extends HTMLHelper.createButtonOptions {
            /**
             * The action to preform when this button is clicked
             */
            action: 'hide-modal'|Function;
        }

        export interface Options {
            // If true, the modal will remove itself from the DOM when it's hidden
            removeOnHidden?: boolean;

            // If true, display this modal should take up the full size of the showcase
            full?: boolean;

            actions?: Action[];
        }
    }
}
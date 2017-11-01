namespace RideStylerShowcase {
    const modalClass = 'ridestyler-showcase-modal';
    const backdropClass = modalClass + '-backdrop';

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
        private readonly options: RideStylerShowcaseModal.Options;

        constructor(showcaseInstance:RideStylerShowcaseInstance, options: RideStylerShowcaseModal.Options) {
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
            this.component = HTMLHelper.createElement('div', {
                className: modalClass
            });

            if (this.options.full) this.component.classList.add(modalClass + '-full')

            HTMLHelper.createElement('button', {
                className: 'ridestyler-showcase-modal-close',
                appendTo: this.component
            }).addEventListener('click', () => {
                this.hide();
            });
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
        export interface Options {
            // If true, the modal will remove itself from the DOM when it's hidden
            removeOnHidden?: boolean;

            // If true, display this modal should take up the full size of the showcase
            full?: boolean;
        }
    }
}
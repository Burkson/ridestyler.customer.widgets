namespace RideStylerShowcase {
    import Page = RideStylerShowcaseProductModal.Page;

    const productModalClass = 'ridestyler-showcase-product-modal';
    const pageClass = productModalClass + '-page';

    export abstract class RideStylerShowcaseProductModal extends RideStylerShowcaseModal {
        protected titleElement:HTMLElement;
        protected brandTitleElement:HTMLElement;
        protected summaryElement:HTMLElement;
        protected summaryContainer:HTMLElement;

        protected toggleButton:RideStylerShowcaseToggleButton;
        
        protected imageContainer:HTMLElement;
        protected image:ResizeableResourceImage<any>;

        protected pages:Page[];

        constructor(showcaseInstance:RideStylerShowcaseInstance) {
            super(showcaseInstance, {
                removeOnHidden: true
            });
        }

        protected buildModal() {
            super.buildModal();

            this.component.classList.add(productModalClass);
            
            this.toggleButton = new RideStylerShowcaseToggleButton(this.showcase);
            this.toggleButton.onChanged = value => {
                // Show the correct page when the toggle button is changed
                for (const page of this.pages) {
                    if (page.label === value) {
                        this.showPage(page);
                        return;
                    }
                }
            };
            this.component.appendChild(this.toggleButton.component);
            
            HTMLHelper.createElement('h1', {
                className: productModalClass + '-title',
                appendTo: this.component,
                append: [
                    this.brandTitleElement = HTMLHelper.createElementWithClass('span', 'subtitle'),
                    this.titleElement = HTMLHelper.createElement('span')
                ]
            });

            this.summaryContainer = HTMLHelper.createElement({
                className: productModalClass + '-summary-container'
            });

            this.imageContainer = HTMLHelper.createElement({
                className: productModalClass + '-image',
                appendTo: this.summaryContainer
            });

            this.image = this.createImage();

            this.summaryElement = HTMLHelper.createElement({
                className: productModalClass + '-summary',
                appendTo: this.summaryContainer
            });

            this.addPage({
                label: strings.getString('summary'),
                container: this.summaryContainer
            }, true);
        }

        /**
         * Create the ResizeableResourceImage element for this product
         */
        protected abstract createImage():ResizeableResourceImage<any>;

        /**
         * Add a new page to the product modal and toggle button
         * @param page The new page
         * @param setVisible If true, show the page after adding it
         */
        protected addPage(page:Page, setVisible:boolean = false) {
            if (!this.pages) this.pages = [];

            this.pages.push(page);

            this.toggleButton.addOption({
                label: page.label,
                value: page.label
            });

            if (setVisible) this.showPage(page);
            else VisibilityHelper.setVisibility(page.container, false);

            page.container.classList.add(pageClass);

            this.component.appendChild(page.container);
        }

        /**
         * Set the page as visible and hide the other pages, update the state of the toggle button
         * @param newPage The page to show
         */
        protected showPage(newPage:Page) {
            for (const page of this.pages)
                VisibilityHelper.setVisibility(page.container, page === newPage);
            
            this.toggleButton.setValue(newPage.label);
        }

        protected onHidden() {
            this.image.destroy();
        }
    }

    export namespace RideStylerShowcaseProductModal {
        export interface Page {
            /**
             * The container to show when the page is activated
             */
            container:HTMLElement;
            
            /**
             * The label to show for the container in the toggle button
             */
            label:string;
        }
    }
}
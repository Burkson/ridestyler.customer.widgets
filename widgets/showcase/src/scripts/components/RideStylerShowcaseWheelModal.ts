namespace RideStylerShowcase {
    const wheelModalClass = 'ridestyler-showcase-wheel-modal';
    const productModalClass = 'ridestyler-showcase-product-modal';

    import WheelModelDescriptionModel = ridestyler.Descriptions.WheelModelDescriptionModel

    export class RideStylerShowcaseWheelModal extends RideStylerShowcaseModal {
        private image:ResizeableResourceImage<"wheel/image">;
        private titleElement:HTMLElement;
        private descriptionElement:HTMLElement;

        constructor(showcaseInstance:RideStylerShowcaseInstance, wheelModel:WheelModelDescriptionModel) {
            super(showcaseInstance, {
                removeOnHidden: true,
                actions: [
                    {
                        action: () => {
                            new RideStylerShowcaseWheelSpecsModal(this.showcase, wheelModel).show()
                        },
                        primary: true,
                        text: strings.getString('show-specs')
                    }
                ]
            });

            this.update(wheelModel);
        }

        protected buildModal() {
            super.buildModal();

            this.component.classList.add(wheelModalClass);

            let imageContainer = HTMLHelper.createElement('div', {
                className: productModalClass + '-image',
                appendTo: this.component
            });

            this.image = new ResizeableResourceImage<"wheel/image">(imageContainer, {
                action: "wheel/image"
            });

            this.titleElement = HTMLHelper.createElement('h1', {
                className: productModalClass + '-title',
                appendTo: this.component
            })

            this.descriptionElement = HTMLHelper.createElement('div', {
                className: productModalClass + '-body',
                appendTo: this.component
            });
        }

        public update(wheelModel:WheelModelDescriptionModel) {
            // Image
            this.image.update({
                WheelFitmentResourceType: ridestyler.DataObjects.WheelFitmentResourceType.Catalog,
                WheelModel: wheelModel.WheelModelID
            });

            // Title
            HTMLHelper.setText(this.titleElement, wheelModel.WheelBrandName + ' ' + wheelModel.WheelModelName + ' ' + wheelModel.WheelModelFinishDescription);

            // Description
            HTMLHelper.setText(this.descriptionElement, RideStylerShowcaseWheelModal.getDescription(wheelModel));
        }

        public static getDescription(wheelModel:WheelModelDescriptionModel):string {
            return wheelModel.Meta && wheelModel.Meta.Description || strings.getString('no-description-wheel');
        }
    }
}
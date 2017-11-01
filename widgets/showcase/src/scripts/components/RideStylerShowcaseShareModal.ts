namespace RideStylerShowcase {
    export class RideStylerShowcaseShareModal extends RideStylerShowcaseModal {
        private readonly vehicleRenderInstructions:ridestyler.Requests.VehicleRenderInstructions;

        constructor(showcaseInstance: RideStylerShowcaseInstance, vehicleRenderInstructions:ridestyler.Requests.VehicleRenderInstructions) {
            super(showcaseInstance, {
                removeOnHidden: true,
                full: true
            });

            this.vehicleRenderInstructions = Object.assign({}, vehicleRenderInstructions);
            this.updateQRCode();
        }

        private vehicleViewport: RideStylerViewport;
        
        private rotateElement: HTMLElement;

        private imageType: ridestyler.DataObjects.VehicleResourceType = ridestyler.DataObjects.VehicleResourceType.Angle;

        private qrCode: RideStylerShowcaseQRCodeComponent;

        /**
         * Build the DOM structure
         */
        protected buildModal() {
            super.buildModal();

            this.component.classList.add('ridestyler-showcase-share');

            let background = new RideStylerShowcaseBackground(this.showcase);
            this.component.appendChild(background.component);

            // Logo
            HTMLHelper.createElement('div', {
                className: 'ridestyler-showcase-logo',
                appendTo: this.component
            });
            
            // Instructions
            HTMLHelper.createElement('p', {
                className: 'ridestyler-showcase-share-instructions',
                text: strings.getString('share-instructions'),
                appendTo: this.component
            });

            // QR Code
            this.qrCode = new RideStylerShowcaseQRCodeComponent(this.showcase);  
            this.component.appendChild(this.qrCode.component);
            
            // Rotate UI
            if (this.canSwitchAngle()) {
                this.rotateElement = HTMLHelper.createElement('div', {
                    className: 'ridestyler-showcase-rotate-vehicle',
                    appendTo: this.component
                });
                
                this.rotateElement.addEventListener('click', () => this.switchAngle());
            }
        }
        
        protected onShow() {
            super.onShow();
            
            this.setupViewport();
        }

        private getShareURL():string {
            const shareURL = 'https://app.ridestyler.net/share.cshtml?';
            const shareParams = ridestyler.utils.toParamString(
                ObjectHelper.assign(
                    ridestyler.auth.authenticateData(null),
                    this.vehicleRenderInstructions
                )
            );

            return shareURL + shareParams;
        }
        
        private setupViewport() {
            let viewportElement = HTMLHelper.createElementWithClass('div', 'ridestyler-showcase-viewport');
            this.component.appendChild(viewportElement);

            viewportElement.addEventListener('click', () => this.switchAngle());
            
            this.vehicleViewport = new RideStylerViewport(viewportElement);

            let viewportUpdated =this.vehicleViewport.Update(this.vehicleRenderInstructions);
            
            if (this.rotateElement) viewportUpdated.done(() => {
                this.rotateElement.classList.add('in');
            });
        }


        private canSwitchAngle():boolean {
            let {
                currentVehicleDescriptionModel
            } = this.state.getData();

            return currentVehicleDescriptionModel.HasAngledImage && currentVehicleDescriptionModel.HasSideImage;
        }

        private updateQRCode() {
            this.qrCode.displayURL(this.getShareURL(), true);
        }

        private switchAngle() {
            if (!this.canSwitchAngle()) return;

            if (this.imageType === ridestyler.DataObjects.VehicleResourceType.Angle)
                this.imageType = ridestyler.DataObjects.VehicleResourceType.Side;
            else
                this.imageType = ridestyler.DataObjects.VehicleResourceType.Angle;
            
            this.vehicleRenderInstructions.Type = this.imageType;
            
            this.vehicleViewport.Update({
                Type: this.imageType
            });
            this.updateQRCode();
        }
    }
}
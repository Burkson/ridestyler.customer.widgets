namespace RideStylerShowcase {
    const shareModalClass = 'ridestyler-showcase-share';
    export class RideStylerShowcaseShareModal extends RideStylerShowcaseModal {
        private readonly vehicleRenderInstructions:ridestyler.Requests.VehicleRenderInstructions;
        private shareButtons:share.ShareButton[];

        constructor(showcaseInstance: RideStylerShowcaseInstance, vehicleRenderInstructions:ridestyler.Requests.VehicleRenderInstructions) {
            super(showcaseInstance, {
                removeOnHidden: true,
                full: true
            });

            // Copy the render instructions
            this.vehicleRenderInstructions = Object.assign({}, vehicleRenderInstructions);
            this.onInstructionsChanged();
        }

        private vehicleViewport: RideStylerViewport;
        
        private rotateElement: HTMLElement;

        private imageType: ridestyler.DataObjects.VehicleResourceType = ridestyler.DataObjects.VehicleResourceType.Angle;

        /**
         * Build the DOM structure
         */
        protected buildModal() {
            super.buildModal();

            this.component.classList.add(shareModalClass);

            let background = new RideStylerShowcaseBackground(this.showcase);
            this.component.appendChild(background.component);            
            
            HTMLHelper.createElement('h1', {
                appendTo: this.component,
                text: strings.getString('share-my-vehicle')
            });
            
            // Instructions
            HTMLHelper.createElement('p', {
                className: 'ridestyler-showcase-share-instructions',
                text: strings.getString('share-instructions'),
                appendTo: this.component
            });

            this.createShareButtons();

            // Rotate UI
            if (this.canSwitchAngle()) {
                this.rotateElement = HTMLHelper.createElement('div', {
                    className: 'ridestyler-showcase-rotate-vehicle',
                    appendTo: this.component
                });
                
                this.rotateElement.addEventListener('click', () => this.switchAngle());
            }
        }

        private createShareButtons() {
            this.shareButtons = [
                new share.FacebookShareButton(),
                new share.TwitterShareButton(),
                new share.QRShareButton(),
                new share.NewWindowShareButton()
            ];

            const shareButtonContainer = HTMLHelper.createElement({
                className: shareModalClass + '-buttons',
                appendTo: this.component
            });

            for (const shareButton of this.shareButtons) 
                shareButtonContainer.appendChild(shareButton.component);
        }
        
        protected onShow() {
            super.onShow();
            
            this.setupViewport();

            this.events.on('resized', this.resizedCallback);
        }

        protected onHidden() {
            super.onHidden();
            
            this.events.off('resized', this.resizedCallback);
        }

        private resizedCallback = () => this.updateViewport();
        private updateViewport() { this.vehicleViewport.Update(this.vehicleRenderInstructions); }

        private getShareURL():string {
            let appURL = 'https://app.ridestyler.net';

            if (api.environment === api.Environment.Alpha) appURL = 'http://app-alpha.ridestyler.net';
            else if (api.environment === api.Environment.Beta) appURL = 'http://app-beta.ridestyler.net';

            const sharePath = '/share.cshtml?';

            const shareParams = ridestyler.utils.toParamString(
                ObjectHelper.assign(
                    ridestyler.auth.authenticateData(null),
                    this.vehicleRenderInstructions
                )
            );

            return appURL + sharePath + shareParams;
        }
        
        private setupViewport() {
            let viewportElement = HTMLHelper.createElementWithClass('div', 'ridestyler-showcase-viewport');
            this.component.appendChild(viewportElement);

            viewportElement.addEventListener('click', () => this.switchAngle());
            
            this.vehicleViewport = new RideStylerViewport(viewportElement);

            let viewportUpdated = this.vehicleViewport.Update(this.vehicleRenderInstructions);
            
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

        private onInstructionsChanged() {
            const shareURL = this.getShareURL();

            this.setEnabled(false);

            api.request("link/create", {
                URL: this.getShareURL()
            }).done(response => {
                this.updateURL(response.ShortURL);
                this.setEnabled(true);
            });
        }

        private setEnabled(enabled:boolean) {
            for (const shareButton of this.shareButtons) {
                shareButton.component.disabled = !enabled;
            }
        }

        private updateURL(shareURL:string) {
            const shareTags:string[] = ['vehicle'];
            const shareMessage = strings.getString('check-out-my-vehicle');

            if (this.vehicleRenderInstructions.WheelFitment) shareTags.push('wheels');
            
            // Update the share buttons
            for (const shareButton of this.shareButtons) {
                shareButton.setURL(shareURL);
                shareButton.setTags(shareTags);
                shareButton.setMessage(shareMessage);
            }
        }

        private switchAngle() {
            if (!this.canSwitchAngle()  || this.state.getData().currentWheel.HasSideImage === false) return;

            if (this.imageType === ridestyler.DataObjects.VehicleResourceType.Angle)
                this.imageType = ridestyler.DataObjects.VehicleResourceType.Side;
            else
                this.imageType = ridestyler.DataObjects.VehicleResourceType.Angle;
            
            this.vehicleRenderInstructions.Type = this.imageType;
            
            this.vehicleViewport.Update({
                Type: this.imageType
            });
            this.onInstructionsChanged();
        }
    }
}
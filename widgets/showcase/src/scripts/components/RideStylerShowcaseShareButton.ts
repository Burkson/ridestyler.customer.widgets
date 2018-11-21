namespace RideStylerShowcase.share {
    const buttonClass = 'ridestyler-showcase-share-button'

    export abstract class ShareButton implements IComponent {
        public readonly component:HTMLButtonElement;
        
        /**
         * The current URL to share
         */
        protected currentURL:string;

        /**
         * The currently rendered vehicle instructions
         */
        protected currentInstructions:ridestyler.Requests.VehicleRenderInstructions;

        /**
         * The tags to attach to the message
         */
        protected tags:string[];

        /**
         * The text to share with the URL
         */
        protected message:string;

        constructor(settings:ShareButton.Settings) {
            this.component = HTMLHelper.createButton({
                className: buttonClass
            });

            if (settings.className) this.component.classList.add(settings.className);
            if (settings.title) this.component.title = settings.title;

            this.component.addEventListener('click', () => this.onClick());
        }

        /**
         * Update the URL for this share button to share
         * @param url The URL to share
         */
        public setURL(url:string) {
            this.currentURL = url;
        }

        /**
         * Attach tags to the message being shared
         * @param tags The tags to attach to the message
         */
        public setTags(tags:string[]) {
            this.tags = tags;
        }

        /**
         * Set a message to share with the URL
         * @param message The message to share along with the URL
         */
        public setMessage(message:string) {
            this.message = message;
        }

        /**
         * Set the current instructions to share
         * @param instructions The instructions to set
         */
        public setInstructions(instructions: ridestyler.Requests.VehicleRenderInstructions) {
            this.currentInstructions = instructions;
        }

        /**
         * Called every time the share button is clicked
         * @virtual
         */
        protected onClick() {
            if (!this.currentURL) return;

            this.share();
        }

        /**
         * Share the current URL
         * @virtual
         */
        public share() {}

        protected openNewWindow(url:string, settings?:{
            width?: number,
            height?: number,
            enableScrollbars?: boolean,
            enableResizeable?: boolean,
            enableToolbar?: boolean,
            enableLocation?: boolean,
            target?: string
        }) {
            settings = settings || {};

            const defaultHeight = 420,
                  defaultWidth = 550;

            const width = settings.width || defaultWidth,
                  height = settings.height || defaultHeight;

            const screenHeight = screen.height,
                  screenWidth = screen.width;
            
            const top = screenHeight > height ? Math.round((screenHeight / 2) - (height / 2)) : 0,
                  left = Math.round((screenWidth / 2) - (width / 2));
            
            const target = settings.target || 'share';

            const windowSettings:string[] = [];
            const addSetting = (name:string, value:string) => windowSettings.push(name + '=' + value);
            const addBooleanSetting = (name:string, enabled:boolean, enabledByDefault:boolean) => {
                if (typeof enabled !== 'boolean') enabled = enabledByDefault;

                addSetting(name, enabled ? 'yes' : 'no');
            };

            addBooleanSetting('scrollbars', settings.enableScrollbars, true);
            addBooleanSetting('resizable', settings.enableResizeable, true);
            addBooleanSetting('toolbar', settings.enableToolbar, false);
            addBooleanSetting('location', settings.enableLocation, true);

            addSetting('width', width.toString());
            addSetting('height', height.toString());
            addSetting('top', top.toString());
            addSetting('left', left.toString());
            
            window.open(url, target, target !== '_blank' ? windowSettings.join(',') : '');
        }

        protected getShareRedirectURL():string {
            let appURL = 'https://app.ridestyler.net';

            if (api.environment === api.Environment.Alpha) appURL = 'http://app-alpha.ridestyler.net';
            else if (api.environment === api.Environment.Beta) appURL = 'http://app-beta.ridestyler.net';

            return appURL + '/shared.html';
        }
    }

    export namespace ShareButton {
        export interface Settings {
            className?: string;
            title?: string;
        }
    }

    const twitterIntentURL = '';
    export class TwitterShareButton extends ShareButton {
        constructor() {
            super({
                className: buttonClass + '-twitter',
                title: 'Twitter'
            });
        }

        /**
         * Share the current URL via Twitter
         */
        public share() {
            let url = 'https://twitter.com/intent/tweet?';
            let twitterIntentParameters = [
                'url=' + encodeURIComponent(this.currentURL)
            ];

            if (this.message) 
                twitterIntentParameters.push('text=' + encodeURIComponent(this.message));
            
            if (this.tags && this.tags.length)
                twitterIntentParameters.push('hashtags=' + ArrayHelper.map(this.tags, tag => encodeURIComponent(tag)).join(','));

            url += twitterIntentParameters.join('&');

            this.openNewWindow(url);
        }
    }

    export class FacebookShareButton extends ShareButton {
        constructor() {
            super({
                className: buttonClass + '-facebook',
                title: 'Facebook'
            });
        }
        
        /**
         * Share the current URL via Facebook
         */
        public share() {
            let url = 'https://www.facebook.com/dialog/share?';
            let facebookDialogParameters = [
                'app_id=1576380412582845',
                'display=popup',
                'href=' + encodeURIComponent(this.currentURL),
                'redirect_uri=' + encodeURIComponent(this.getShareRedirectURL())
            ];
            
            // Facebook only lets you specify one hashtag, so we use the first
            if (this.tags && this.tags.length)
                facebookDialogParameters.push('hashtag=' + encodeURIComponent('#' + this.tags[0]));

            url += facebookDialogParameters.join('&');

            this.openNewWindow(url);
        }
    }

    export class EmailShareButton extends ShareButton {
        private popover:RideStylerShowcasePopover;

        constructor() {
            super({
                className: buttonClass + '-email'
            });

            this.popover = new RideStylerShowcasePopover();
            this.component.appendChild(this.popover.component);

            this.buildPopover();
        }

        private buildPopover() {
            const form:HTMLFormElement = HTMLHelper.createElement('form', {
                appendTo: this.popover.component
            });

            const emailInput:HTMLInputElement = HTMLHelper.createElement('input', {
                properties: {
                    type: 'email',
                    placeholder: 'Enter your email'
                },
                appendTo: form
            });

            const submitButton:HTMLButtonElement = HTMLHelper.createButton({
                text: 'Send',
                properties: {
                    type: 'submit'
                },
                appendTo: form
            });

            this.popover.component.addEventListener('click', function (e) {
                e.stopPropagation();
            });

            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const submittedEmail = emailInput.value;

                if (!submittedEmail || submitButton.disabled) return;

                submitButton.disabled = true;

                const request = ObjectHelper.assign<ridestyler.Requests.ShareVehicleRequest>({
                    Mode: "Email",
                    To: submittedEmail
                }, this.currentInstructions);
                
                api.request("share/vehicle", request)
                    .done(function () {
                        emailInput.value = '';

                        submitButton.style.backgroundColor = 'rgb(0,180,0)';
                        submitButton.style.borderColor = 'rgb(0,100,0)';
                        HTMLHelper.setText(submitButton, "Sent!");
                    })
                    .fail(function () {
                        submitButton.style.backgroundColor = 'rgb(180,0,0)';
                        submitButton.style.borderColor = 'rgb(100,0,0)';
                        HTMLHelper.setText(submitButton, "Error");
                    })
                    .always(function () {
                        submitButton.disabled = false;

                        setTimeout(function () {
                            submitButton.style.backgroundColor = submitButton.style.borderColor = '';
                            HTMLHelper.setText(submitButton, "Send");
                        }, 5000);
                    })
            });
        }

        public onClick() {
            this.popover.toggle();
        }
    }

    export class NewWindowShareButton extends ShareButton {
        constructor() {
            super({
                className: buttonClass + '-link'
            });
        }
        
        /**
         * Share the current URL by opening it in a new window
         */
        public share() {
            this.openNewWindow(this.currentURL, {
                target: '_blank'
            });
        }
    }

    export class QRShareButton extends ShareButton {
        private popover:RideStylerShowcasePopover;
        private qrCode:RideStylerShowcaseQRCodeComponent;

        constructor() {
            super({
                className: buttonClass + '-qr-code'
            });

            this.popover = new RideStylerShowcasePopover();
            this.component.appendChild(this.popover.component);

            this.qrCode = new RideStylerShowcaseQRCodeComponent();
            this.popover.component.appendChild(this.qrCode.component);
        }

        public setURL(url:string) {
            super.setURL(url);

            this.qrCode.displayURL(url);
        }

        public onClick() {
            this.popover.toggle();
        }
    }
}
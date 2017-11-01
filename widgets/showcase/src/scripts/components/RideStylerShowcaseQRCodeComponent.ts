namespace RideStylerShowcase {
    const className = 'ridestyler-showcase-qr-display';

    export class RideStylerShowcaseQRCodeComponent extends ComponentBase {
        private qrCodeElement:HTMLElement;
        private linkElement:HTMLAnchorElement;

        private qrCode:QRCode;

        constructor(showcaseInstance:RideStylerShowcaseInstance, link?:string, shorten:boolean = false) {
            super(showcaseInstance);

            this.component = HTMLHelper.createElement('div', {
                className: className
            })
            
            this.component.addEventListener('click', () => this.linkElement.dispatchEvent(new Event("click")));

            this.qrCodeElement = HTMLHelper.createElement('div', {
                className: className + '-image',
                appendTo: this.component
            })

            this.linkElement = HTMLHelper.createElement('a', {
                className: className + '-link',
                appendTo: this.component,
                properties: {
                    target: '_blank'
                }
            });

            this.qrCode = new QRCode(this.qrCodeElement);
            
            if (link) this.displayURL(link, shorten);
        }

        private shorten(url:string):RideStylerPromise<string> {
            return PromiseHelper.then(api.request("link/create", {
                URL: url
            }), response => response.ShortURL);
        }

        public displayURL(url:string, shorten = false) {
            if (shorten) return this.shorten(url).done(shortURL => this.displayURL(shortURL, false));

            this.linkElement.href = url;
            HTMLHelper.setText(this.linkElement, url);
            this.qrCode.makeCode(url);
        }
    }
}
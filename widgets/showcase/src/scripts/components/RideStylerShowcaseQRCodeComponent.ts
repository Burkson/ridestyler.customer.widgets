namespace RideStylerShowcase {
    const className = 'ridestyler-showcase-qr-display';

    export class RideStylerShowcaseQRCodeComponent implements IComponent {
        private qrCodeElement:HTMLAnchorElement;
        private qrCode:QRCode;

        public component:HTMLElement;

        constructor(link?:string) {
            this.component = HTMLHelper.createElement('div', {
                className: className
            });

            this.qrCodeElement = HTMLHelper.createElement('a', {
                className: className + '-image',
                appendTo: this.component,
                properties: {
                    target: '_blank'
                }
            });

            this.qrCode = new QRCode(this.qrCodeElement);
            
            if (link) this.displayURL(link);
        }

        public displayURL(url:string) {
            this.qrCodeElement.href = url;
            this.qrCode.makeCode(url);
        }
    }
}
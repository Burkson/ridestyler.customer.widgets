declare class QRCode {
    constructor (elementID:string, text?:string);
    constructor (elementID:string, options?:QRCode.Options);
    constructor (element:HTMLElement, text?:string);
    constructor (element:HTMLElement, options?:QRCode.Options);

    /**
     * Change the value of the QR Code
     * @param text The new text for the QR Code
     */
    public makeCode(text:string);
    public clear();
}

declare namespace QRCode {
    interface Options {
        text: string;
        width?: number;
        height?: number;
        colorDark?: string;
        colorLight?: string;
        correctLevel?: CorrectLevel;
    }

    export enum CorrectLevel {
        L = 1,
        M = 0,
        Q = 3,
        H = 2
    }
}
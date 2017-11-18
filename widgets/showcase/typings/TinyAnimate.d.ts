declare namespace TinyAnimate {
    export function animate(from:number, to:number, duration:number, update:UpdateFunction, easing?:Easing, done?:Callback)
    export function animateCSS(element:HTMLElement, property:keyof CSSStyleDeclaration, unit:string, from:number, to:number, duration:number, easing?:Easing, done?:Callback);

    export type Easing = BuiltInEasing|string|EasingFunction;

    export type BuiltInEasing = 'linear'|'easeInQuad'|'easeOutQuad'|'easeInOutQuad'|'easeInCubic'|'easeOutCubic'|'easeInOutCubic'|'easeInQuart'|'easeOutQuart'|'easeInOutQuart'|'easeInQuint'|'easeOutQuint'|'easeInOutQuint'|'easeInSine'|'easeOutSine'|'easeInOutSine'|'easeInExpo'|'easeOutExpo'|'easeInOutExpo'|'easeInCirc'|'easeOutCirc'|'easeInOutCirc'|'easeInElastic'|'easeOutElastic'|'easeInOutElastic'|'easeInBack'|'easeOutBack'|'easeInOutBack'|'easeInBounce'|'easeOutBounce'|'easeInOutBounce';
    
    export interface EasingFunction {
        (currentTime:number, beginningValue:number, valueChange:number, duration:number)
    }

    export interface UpdateFunction {
        (value:number):void;
    }

    export interface Animation {
        cancel: () => void;
    }

    export interface Callback {
        ():void;
    }
}
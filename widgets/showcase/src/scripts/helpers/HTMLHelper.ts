namespace RideStylerShowcase.HTMLHelper {

    export function childrenMatching<T extends HTMLElement>(element:HTMLElement, match: (element:HTMLElement)=>boolean): T[] {
        let matchingChildren: T[] = new Array(element.children.length);

        let matchingChildrenIndex = 0;
        for (let index = 0; index < element.children.length; index++) {
            let child = element.children[index] as T;

            if (match(child)) {
                matchingChildren[matchingChildrenIndex++] = child;
            }
        }

        matchingChildren.length = matchingChildrenIndex;
        return matchingChildren;
    }

    /**
     * Returns an array of element's children matching the passed in set of 
     * @param element The element to search the children of
     * @param classes The set of classes to match children with
     */
    export function childrenWithClasses<T extends HTMLElement>(element:HTMLElement, ...classes:string[]):T[] {
        classes = StyleHelper.flattenClassList(classes);
        
        return childrenMatching(element, child => StyleHelper.hasClasses(child, classes));
    }

    /**
     * Removes children from the element matching a class or set of classes
     * @param element The element to search the children
     * @param classes The classes to match children to remove
     */
    export function removeChildrenWithClasses(element:HTMLElement, ...classes:string[]) {
        for (let child of childrenWithClasses(element, ...classes)) {
            element.removeChild(child);
        }
    }

    /**
     * Search an element for the first child matching the match function
     * @param element The element to search children of
     * @param match The match function
     */
    export function firstChildMatching<T extends HTMLElement>(element:HTMLElement, match: (element:HTMLElement)=>boolean):T {
        for (let index = 0; index < element.children.length; index++) {
            let child = element.children[index] as HTMLElement;
            
            if (match(child)) return child as T;
        }

        return null;
    }

    /**
     * Search an element for the first child with the specified tag
     * @param element The element to search children of
     * @param tagName The tag to look for
     */
    export function firstChildWithTag<T extends HTMLElement>(element:HTMLElement, tagName:string):T {
        tagName = tagName.toUpperCase();

        return firstChildMatching(element, child => child.tagName === tagName);
    }

    /**
     * Search an element for the first child with the specified class(es) in its class list
     * @param element The element to search children of
     * @param classes The classes to look for
     */
    export function firstChildWithClass<T extends HTMLElement>(element: HTMLElement, ...classes: string[]):T {
        return firstChildMatching(element, child => StyleHelper.hasClasses(child, classes));
    }

    /**
     * Detects if an element has a child with the specified class(es)
     * @param element The element to search the children of
     * @param classes The class(es) to look for
     */
    export function hasChildWithClass(element: HTMLElement, ...classes: string[]):boolean {
        return !!firstChildWithClass(element, ...classes);
    }

    /**
     * Detects if an element has a sibling with the specified class(es)
     * @param element The element to search the siblings of
     * @param classes The class(es) to look for
     */
    export function hasSiblingWithClass(element:HTMLElement, ...classes:string[]):boolean {
        return hasChildWithClass(element.parentElement, ...classes);
    }

    export interface createElementOptions<ElementType extends Element> {
        /**
         * Specifies a class to add to the element
         */
        className?:string;
        /**
         * Specifies an ID to add to the element
         */
        id?: string;
        /**
         * Specifies an element to append the created element to
         */
        appendTo?:Node;
        /**
         * Specifies text to add to the element
         */
        text?:string;
        /**
         * Specifies an element or elements to append to the created element
         */
        append?: Node|Node[];
        /**
         * Specifies attributes to add to the created element
         */
        attributes?: {
            [key:string]: string;
        }
        /**
         * Specifies styles to set on the created element
         */
        style?: {
            [p in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[p];
        };
        /**
         * Specifies properties to set on the created element
         */
        properties?: {
            [key in keyof ElementType]?:ElementType[key];
        };
        /**
         * Specifies a HTML element to wrap the created element in. When used in combination with
         * appendTo, the wrapper will be appended to the element.
         */
        wrap?: HTMLElement;
    }

    function applyOptions(element:Element, options: createElementOptions<Element>) {
        let htmlElement = element as HTMLElement;

        if (typeof options !== 'object') return;
        
        if (typeof options.className === 'string') element.className = options.className;
        if (typeof options.id === 'string') element.id = options.id;
        if (options.wrap) options.wrap.appendChild(element);
        if (options.appendTo) options.appendTo.appendChild(options.wrap || element);
        if (typeof options.text === 'string') element.appendChild(document.createTextNode(options.text));
        if (options.append) {
            if (options.append instanceof Array) {
                for (let childElement of options.append) {
                    element.appendChild(childElement);
                }
            } else {
                element.appendChild(options.append);
            }

            document.createElementNS
        }
        if (options.attributes) {
            for (let key in options.attributes) {
                if (options.attributes.hasOwnProperty(key)) {
                    element.setAttribute(key, options.attributes[key]);
                }
            }
        }
        if (options.style && typeof htmlElement.style === 'object') {
            for (let key in options.style) {
                if (options.style.hasOwnProperty(key)) {
                    htmlElement.style[key] = options.style[key];
                }
            }
        }
        if (options.properties) {
            for (let key in options.properties) {
                if (options.properties.hasOwnProperty(key)) {
                    element[key] = options.properties[key];
                }
            }
        }
    }

    /**
     * Create a DIV
     * @param options Additional operations to perform on the element
     */
    export function createElement(options?:createElementOptions<HTMLDivElement>): HTMLDivElement;
    /**
     * Create an element
     * @param tagName The tag of the element to create
     * @param options Additional operations to perform on the element
     */
    export function createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?:createElementOptions<HTMLElementTagNameMap[K]>): HTMLElementTagNameMap[K];
    /**
     * Create an element
     * @param tagName The tag of the element to create
     * @param options Additional operations to perform on the element
     */
    export function createElement(tagName: string, options?:createElementOptions<HTMLElement>): HTMLElement;
    export function createElement(tagNameOrDivOptions:string|createElementOptions<HTMLDivElement>, options?:createElementOptions<HTMLElement>): HTMLElement {
        let tagName:string;
        
        if (typeof tagNameOrDivOptions === 'string') tagName = tagNameOrDivOptions;
        else {
            tagName = 'div';
            options = tagNameOrDivOptions;
        }

        let element = document.createElement(tagName);

        applyOptions(element, options);

        return element;
    }

    export function createElementWithText<K extends keyof HTMLElementTagNameMap>(tagName: K, text:string): HTMLElementTagNameMap[K];
    export function createElementWithText(tagName: string, text:string): HTMLElement;
    /**
     * Creates an element with the specified text
     * @param tagName The tag of the element to create
     * @param text The text to add to the created element
     */
    export function createElementWithText(tagName:string, text:string): HTMLElement {
        return createElement(tagName, {text: text});
    }
    
    export function createElementWithClass<K extends keyof HTMLElementTagNameMap>(tagName: K, className:string): HTMLElementTagNameMap[K];
    export function createElementWithClass(tagName: string, className:string): HTMLElement;
    /**
     * Creates an element with the specified class
     * @param tagName The tag of the element to create
     * @param className The class to add to the element
     */
    export function createElementWithClass(tagName:string, className:string): HTMLElement {
        return createElement(tagName, {className: className});
    }

    export function createElementWithID<K extends keyof HTMLElementTagNameMap>(tagName: K, id:string): HTMLElementTagNameMap[K];
    export function createElementWithID(tagName: string, id:string): HTMLElement;
    /**
     * Creates an element with the specified id
     * @param tagName The tag of the element to create
     * @param id The id to add to the element
     */
    export function createElementWithID(tagName:string, id:string): HTMLElement {
        return createElement(tagName, {id: id});
    }

    /**
     * Create a new text element
     * @param text The text to create the text element with
     */
    export function createTextElement(text:string): Text {
        return document.createTextNode(text);
    }

    export interface createButtonOptions extends createElementOptions<HTMLButtonElement> {
        /**
         * If true, disable the created button
         */
        disabled?:boolean;
        /**
         * If true, create a large button
         */
        large?:boolean;
        /**
         * If true, create a primary button
         */
        primary?:boolean;
        /**
         * If true, create a link button
         */
        link?: boolean;
    }
    export function createButton(options:createButtonOptions) {
        var element = createElement('button', options);

        const buttonClassName = 'ridestyler-showcase-button';
        element.classList.add(buttonClassName);

        if (options.large) element.classList.add(buttonClassName + '-large');
        if (options.primary) element.classList.add(buttonClassName + '-primary');
        if (options.disabled) element.disabled = true;
        if (options.link) element.classList.add(buttonClassName + '-link')

        return element;
    }

    const iconClassPrefix = 'ridestyler-showcase-icon ridestyler-showcase-icon-';
    export interface createIconOptions extends createElementOptions<HTMLElement> {
        /**
         * The class of the icon to create
         */
        icon: string;
    }
    /**
     * Create an icon
     * @param icon The class of the icon to create
     */
    export function createIcon(icon:string) : HTMLElement;
    /**
     * Create an icon
     * @param options Options to create the icon with
     */
    export function createIcon(options:createIconOptions) : HTMLElement;
    export function createIcon(iconOrOptions: string|createIconOptions) : HTMLElement {
        let options:createIconOptions;

        // Setup options
        if (typeof iconOrOptions === 'string') {
            options = {
                icon: iconOrOptions
            };
        } else {
            options = iconOrOptions;
        }
        
        // Build icon className
        {
            let iconClass = options.icon;

            if (!iconClass.startsWith(iconClassPrefix))
                iconClass = iconClassPrefix + iconClass;
            
            if (typeof options.className === 'string')
                iconClass = options.className + ' ' + iconClass;

            options.className = iconClass;
        }
        
        return createElement('i', options);
    }

    export function createSVGElement<K extends keyof ElementTagNameMap>(tagName:K, options:createElementOptions<ElementTagNameMap[K]>) : ElementTagNameMap[K];
    export function createSVGElement(tagName:string, options:createElementOptions<SVGElement>) : SVGElement;
    export function createSVGElement(tagName:string, options:createElementOptions<SVGElement>) : SVGElement {
        let element = document.createElementNS('http://www.w3.org/2000/svg', tagName);

        applyOptions(element, options);

        return element;
    }

    /**
     * Removes all children from an element
     * @param element The element to empty
     */
    export function empty(element:HTMLElement) {
        let child:Node;
        
        while (child = element.lastChild)
            element.removeChild(child);
    }

    /**
     * Binds an event listener that is executed once and then removed from the element
     * @param element The element to bind a listener to
     * @param type The type of event to listen to
     * @param listener The event listener to call when the event is triggered
     * @param useCapture If true, run the listener in the capture phase of the event
     */
    export function once<K extends keyof HTMLElementEventMap>(element:HTMLElement, type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, useCapture?: boolean): void;
    /**
     * Binds an event listener that is executed once and then removed from the element
     * @param element The element to bind a listener to
     * @param type The type of event to listen to
     * @param listener The event listener to call when the event is triggered
     * @param useCapture If true, run the listener in the capture phase of the event
     */
    export function once(element:HTMLElement, type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
    export function once(element:HTMLElement, type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void {
        let onceListener:EventListener = function (evt) {
            element.removeEventListener(type, onceListener, useCapture);

            if (typeof listener === 'object') listener = listener.handleEvent;

            return listener.call(this, evt);
        };

        element.addEventListener(type, onceListener, useCapture);
    }

    /**
     * Returns the document that the element is a part of (if there is one)
     * @param element The element
     */
    export function getDocument(element:HTMLElement):Document {
        return element.ownerDocument;
    }

    /**
     * Returns the window that the element is a part of (if there is one)
     * @param element The element
     */
    export function getWindow(element:HTMLElement):Window {
        return getDocument(element).defaultView;
    }

    /**
     * Sets the content of an element to a string
     * @param element The element
     * @param text The text
     * @returns The element that was passed in
     */
    export function setText(element:HTMLElement, text:string):HTMLElement {
        empty(element);
        element.appendChild(document.createTextNode(text));
        return element;
    }
}
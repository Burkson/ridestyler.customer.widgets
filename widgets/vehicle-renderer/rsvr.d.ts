declare class RideStylerViewport {
    /**
     * Create a new instance of the RideStylerViewport renderer
     * @param selector A selector designating the container to initialize the viewport in
     */
    constructor(selector:string);

    /**
     * Create a new instance of the RideStylerViewport renderer
     * @param element The container to initialize the viewport in
     */
    constructor(element:Node);

    public Update(instructions:ridestyler.Requests.VehicleRenderInstructions): RideStylerPromise;
    public Reset(): void;
    public ResizeRenderArea(): void;
}


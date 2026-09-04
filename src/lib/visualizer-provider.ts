export interface VisualizerProvider {id:string;mount(element:HTMLElement):Promise<void>;setProduct(textureUrl:string):void;destroy():void}
export const providerNote='LocalProvider je aktivan. Licencirani Roomvo, VEEUZE ili TilesView adapter implementira isti interfejs u ovom folderu; ne postoje pretpostavljeni eksterni API pozivi.';

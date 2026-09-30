export interface Product {
  id: string; tenaArticleNumber: string; name: string; variant: string;
  stockUnit: 'verpakking'; packsPerBox: number; piecesPerPack: number;
  sourceReference: string; assortmentVerified: boolean;
}
export interface Location { id: string; name: string; description: string; locationVerified: boolean }
export type Symbology = 'CODE_128' | 'EAN_13' | 'EAN_8' | 'UPC_A';
export interface BarcodeMapping {
  id: string; rawValue: string; symbology: Symbology; productId: string;
  packagingLevel: 'verpakking'; quantityInStockUnits: 1; isDemo: boolean; verified: boolean;
}
export interface StockPosition { productId: string; locationId: string; quantityPacks: number }
export type InputSource = 'camera' | 'manual' | 'productSearch' | 'seed';
export interface Movement {
  id: string; operationId: string; productId: string; locationId: string;
  type: 'OPENING' | 'IN' | 'OUT'; quantityPacks: number; stockBefore: number; stockAfter: number;
  createdAt: string; actor: 'Demogebruiker'; inputSource: InputSource;
  scannedBarcode?: string; isDemoBarcode: boolean;
}
export interface BookingCommand {
  operationId: string; productId: string; locationId: string; type: 'IN' | 'OUT';
  quantityPacks: number; inputSource: Exclude<InputSource, 'seed'>; scannedBarcode?: string;
}
export interface InventorySnapshot {
  products: Product[]; locations: Location[]; stocks: StockPosition[];
  mappings: BarcodeMapping[]; movements: Movement[];
}
export interface InventoryRepository {
  listProducts(): Promise<Product[]>; listLocations(): Promise<Location[]>;
  getStock(): Promise<StockPosition[]>; resolveBarcode(rawValue: string): Promise<BarcodeMapping | undefined>;
  bookMovement(command: BookingCommand): Promise<Movement>; listMovements(): Promise<Movement[]>;
}

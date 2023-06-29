import { Product } from "./product.model.js";

export interface InventoryItem {
    _id: string;
    product: Product;
    condition: string;
    status: string;
    location: string;
    salePrice?: number;
    dateSold?: Date;
}
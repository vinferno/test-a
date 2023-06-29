import { InventoryItem } from "./inventory-item.model.js";
import { User } from "./user.model.js";

export interface CartItem {
    _id: string;
    inventoryItem: InventoryItem;
    user: User
}
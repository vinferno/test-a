import mongoose from 'mongoose';
import { CartItem } from '../../shared/models/cart-item.model.js';
const {Schema, model} = mongoose;

const cartItemSchema = new Schema<CartItem>({
    inventoryItem: {type: Schema.Types.ObjectId, ref: 'InventoryItem'},
    user: {type: Schema.Types.ObjectId, ref: 'User'},
});

export const CartItemModel = model('CartItem', cartItemSchema);
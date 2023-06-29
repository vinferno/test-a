import mongoose from 'mongoose';
import '../../shared/models/cart-item.model.js';
const { Schema, model } = mongoose;
const cartItemSchema = new Schema({
    inventoryItem: { type: Schema.Types.ObjectId, ref: 'InventoryItem' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
});
export const CartItemModel = model('CartItem', cartItemSchema);
//# sourceMappingURL=cartItem.schema.js.map
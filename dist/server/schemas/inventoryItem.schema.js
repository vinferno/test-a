import mongoose from 'mongoose';
import '../../shared/models/inventory-item.model.js';
const { Schema, model } = mongoose;
const inventoryItemSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    condition: String,
    status: String,
    location: String,
    salePrice: Number,
    dateSold: Date
});
export const InventoryItemModel = model('InventoryItem', inventoryItemSchema);
//# sourceMappingURL=inventoryItem.schema.js.map
import mongoose from 'mongoose';
import '../../shared/models/product.model.js';
const { Schema, model } = mongoose;
const productSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
});
export const ProductModel = model('Product', productSchema);
//# sourceMappingURL=product.schema.js.map
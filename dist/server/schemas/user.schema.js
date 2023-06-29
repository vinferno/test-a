import mongoose from 'mongoose';
import '../../shared/models/user.model.js';
const { Schema, model } = mongoose;
const userSchema = new Schema({
    username: { type: String, required: true },
});
export const UserModel = model('User', userSchema);
//# sourceMappingURL=user.schema.js.map
import mongoose from 'mongoose';
import { User } from '../../shared/models/user.model.js';
const {Schema, model} = mongoose;

const userSchema = new Schema<User>({
    username: {type: String, required: true},
});

export const UserModel = model('User', userSchema);
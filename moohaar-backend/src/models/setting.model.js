import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({}, { strict: false });

export default mongoose.model('Setting', SettingSchema);

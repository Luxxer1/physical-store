import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  zipCode: { type: String, required: true },
  address: { type: String, required: true },
  neighborhood: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  phoneNumber: { type: String },
  businessHour: { type: String },
  location: {
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
  },
});

export default mongoose.model('Store', storeSchema);

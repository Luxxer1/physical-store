import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  storeName: String,
  zipCode: String,
  address: String,
  neighborhood: String,
  city: String,
  state: String,
  phoneNumber: String,
  businessHour: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

export default mongoose.model('Store', storeSchema);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Store extends Document {
  @Prop({ required: true })
  storeName: string;

  @Prop({ required: true })
  zipCode: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  number: string;

  @Prop({ required: true })
  neighborhood: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  businessHour: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  })
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export type StoreDocument = Store & Document;
export const StoreSchema = SchemaFactory.createForClass(Store);

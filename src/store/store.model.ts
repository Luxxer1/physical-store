// src/stores/store.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StoreDocument = Store & Document;

@Schema()
export class Store {
  @Prop({ required: true })
  _id: string;

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

  @Prop({ required: true, enum: ['PDV', 'LOJA'], default: 'LOJA' })
  type: string;

  @Prop({ required: true, default: 1 })
  shippingTimeInDays: number;

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
    type: string;
    coordinates: number[];
  };
}

export const StoreSchema = SchemaFactory.createForClass(Store);

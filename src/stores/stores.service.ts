import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store, StoreDocument } from './schema/store.schema';
import { ListAllResponseDto } from './dto/list-stores.response.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectModel(Store.name)
    private readonly storeModel: Model<StoreDocument>,
  ) {}

  async listAll(limit: number, offset: number): Promise<ListAllResponseDto> {
    const take = Number(limit) || 10;
    const skip = Number(offset) || 0;

    const [stores, total] = await Promise.all([
      this.storeModel.find().skip(skip).limit(take).exec(),
      this.storeModel.countDocuments().exec(),
    ]);

    return {
      stores,
      limit: take,
      offset: skip,
      total,
    };
  }
}

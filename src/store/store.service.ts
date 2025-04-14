import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class StoreService {
  constructor (
    @InjectModel(Store.name) private storeModel: Model<StoreDocument> {}
  )
  async findAll() {
    return this.storeModel.find().lean();
  }
}

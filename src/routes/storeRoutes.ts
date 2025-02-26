import express from 'express';
import storeController from '../controllers/storeController';

const router = express.Router();

router.route('/').get(storeController.getAllStores);

router.route('/nearby').post(storeController.getNearbyStores);

export default router;

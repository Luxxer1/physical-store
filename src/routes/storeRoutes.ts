import express from 'express';
import { getAllStores, getNearbyStores } from '../controllers/storeController';

const router = express.Router();

router.route('/').get(getAllStores);

router.route('/:cep').get(getNearbyStores);

// router.route('/nearby').post(storeController.getNearbyStores);

export default router;

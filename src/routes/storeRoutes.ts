import express from 'express';
import { getAllStores } from '../controllers/storeController';

const router = express.Router();

router.route('/').get(getAllStores);

// router.route('/nearby').post(storeController.getNearbyStores);

export default router;

import { Router } from 'express';
import authorize from '../middleware/auth.middleware.js';

// Import all the necessary controller functions
import {
  createSubscription,
  getUserSubscription, 
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  cancelSubscription,
  getUpcomingRenewals
} from '../controllers/subscription.controller.js';

const subscriptionRouter = Router();

// --- PUBLIC/ADMIN ROUTES ---
// Placed specific routes before general/:id route
subscriptionRouter.get('/upcoming-renewals', authorize, getUpcomingRenewals);
subscriptionRouter.get('/', getAllSubscriptions);

// --- USER-SPECIFIC ROUTES (All require authorization) ---
subscriptionRouter.get('/user/:id', authorize, getUserSubscription);

// --- ROUTES FOR A SINGLE SUBSCRIPTION ---
subscriptionRouter.get('/:id', authorize, getSubscriptionById);
subscriptionRouter.post('/', authorize, createSubscription);
subscriptionRouter.put('/:id', authorize, updateSubscription);
subscriptionRouter.put('/:id/cancel', authorize, cancelSubscription);
subscriptionRouter.delete('/:id', authorize, deleteSubscription);


export default subscriptionRouter;
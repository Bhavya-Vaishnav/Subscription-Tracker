import mongoose from "mongoose";
import { SERVER_URL } from "../config/env.js";
import { workflowClient } from "../config/upstash.js";
import Subscription from "../models/subscription.model.js";

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        "content-type": "application/json",
      },
      retries: 0,
    });
    res.status(201).json({ success: true, message: subscription ,workflowRunId});
  } catch (error) {
    next(error);
  }
};

export const getUserSubscription = async (req, res, next) => {
  try {
    if (req.body.userId != req.params.userId) {
      const error = new Error({
        message: "You are not the owner of this account",
      });
      error.statusCode = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({
      userId: req.params._id,
    });
    res.status(201).json({ subscriptions });
  } catch (e) {
    next(e);
  }
};

/**
 * @desc    Get all subscriptions in the database
 * @route   GET /api/subscriptions/
 * @access  Admin
 */
export const getAllSubscriptions = async (req, res, next) => {
  try {
    // This could be a very large list, consider adding pagination for production
    const subscriptions = await Subscription.find({}).populate('user', 'name email');
    res.status(200).json({ success: true, count: subscriptions.length, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single subscription by its ID
 * @route   GET /api/subscriptions/:id
 * @access  Private
 */
export const getSubscriptionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = new Error('Invalid subscription ID format.');
            error.statusCode = 400;
            throw error;
        }

        const subscription = await Subscription.findById(id);

        if (!subscription) {
            const error = new Error('Subscription not found.');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a subscription
 * @route   PUT /api/subscriptions/:id
 * @access  Private (Owner only)
 */
export const updateSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;
        let subscription = await Subscription.findById(id);

        if (!subscription) {
            const error = new Error('Subscription not found.');
            error.statusCode = 404;
            throw error;
        }

        // Ensure the user owns the subscription they are trying to update
        if (subscription.user.toString() !== req.user._id.toString()) {
            const error = new Error('Forbidden: You can only update your own subscriptions.');
            error.statusCode = 403;
            throw error;
        }

        subscription = await Subscription.findByIdAndUpdate(id, req.body, {
            new: true, // Return the modified document
            runValidators: true // Run schema validators on update
        });

        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancel a subscription by updating its status
 * @route   PUT /api/subscriptions/:id/cancel
 * @access  Private (Owner only)
 */
export const cancelSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;
        let subscription = await Subscription.findById(id);

        if (!subscription) {
            const error = new Error('Subscription not found.');
            error.statusCode = 404;
            throw error;
        }

        if (subscription.user.toString() !== req.user._id.toString()) {
            const error = new Error('Forbidden: You can only cancel your own subscriptions.');
            error.statusCode = 403;
            throw error;
        }

        subscription.status = 'cancel';
        await subscription.save();

        res.status(200).json({ success: true, message: 'Subscription cancelled successfully.', data: subscription });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a subscription
 * @route   DELETE /api/subscriptions/:id
 * @access  Private (Owner only)
 */
export const deleteSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const subscription = await Subscription.findById(id);

        if (!subscription) {
            const error = new Error('Subscription not found.');
            error.statusCode = 404;
            throw error;
        }

        if (subscription.user.toString() !== req.user._id.toString()) {
            const error = new Error('Forbidden: You can only delete your own subscriptions.');
            error.statusCode = 403;
            throw error;
        }

        await subscription.deleteOne();

        res.status(200).json({ success: true, message: 'Subscription deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get subscriptions with upcoming renewals
 * @route   GET /api/subscriptions/upcoming-renewals
 * @access  Admin
 */
export const getUpcomingRenewals = async (req, res, next) => {
    try {
        const today = new Date();
        const nextSevenDays = new Date();
        nextSevenDays.setDate(today.getDate() + 7);

        const upcomingSubscriptions = await Subscription.find({
            renewalDate: { $gte: today, $lte: nextSevenDays },
            status: 'active'
        }).sort({ renewalDate: 'asc' });

        res.status(200).json({ success: true, count: upcomingSubscriptions.length, data: upcomingSubscriptions });
    } catch (error) {
        next(error);
    }
};

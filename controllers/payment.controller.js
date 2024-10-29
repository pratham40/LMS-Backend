import Payment from "../models/payment.model.js"
import User from "../models/user.model.js"
import { razorpay } from "../server.js"
import AppError from "../utils/error.util.js"
import crypto from "crypto"

const getRazorpayApiKey = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: "Razorpay Api Key",
            key: process.env.RAZORPAY_KEY_ID
        })
    } catch (error) {
        next(new AppError(error.message, 400))
    }
}

const buySubscription = async (req, res, next) => {
    try {
        const { id } = req.user

        const user = await User.findById(id)

        if (!user) {
            return next(new AppError("Unauthorized user found", 404))
        }

        if (user.role === 'ADMIN') {
            return next(new AppError("Admin can't buy subscription", 400))
        }
        
        const subscription = await razorpay.subscriptions.create({
            plan_id: process.env.RAZORPAY_PLAN_ID,
            customer_notify: 1,
            total_count: 12
        });

        
        user.subscription.id = subscription.id
        user.subscription.status = subscription.status

        await user.save()

        res.status(200).json({
            success: true,
            message: "Subscribed successfully",
            subscription_id: subscription.id,
            subscription_status: subscription.status
        })
    } catch (error) {
        next(new AppError(error.message, 400))
    }

}

const verifySubscription = async (req, res, next) => {
    try {
        const { id } = req.user
        
        const {
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature
        } = req.body

        const user = await User.findById(id)

        if (!user) {
            return next(new AppError("Unauthorized user found", 404))
        }

        const subscriptionId = user.subscription.id

        if (!subscriptionId) {
            return next(new AppError("No active subscription found", 400))
        }

        // Generate signature using the subscription ID and payment ID
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id}|${subscriptionId}`)
            .digest('hex')

        // Verify signature matches
        if (generatedSignature !== razorpay_signature) {
            return next(new AppError("Payment verification failed", 400))
        }

        // Create payment record
        await Payment.create({
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
            user: user._id
        })

        // Update user subscription status
        user.subscription.status = 'active'
        await user.save()

        res.status(200).json({
            success: true,
            message: "Payment verified successfully"
        })
    } catch (error) {
        return next(new AppError(error.message, 500))
    }
}

const cancelSubscription = async (req, res, next) => {
    try {
        const { id } = req.user

        const user = await User.findById(id)

        if (!user) {
            return next(new AppError("Unauthorized user found", 404))
        }

        if (user.role === 'ADMIN') {
            return next(new AppError("Admin can't cancel subscription", 400))
        }

        const subscriptionId = user.subscription.id

        if (!subscriptionId) {
            return next(new AppError("No active subscription found", 400))
        }

        try {
            const subscription = await razorpay.subscriptions.cancel(subscriptionId)
            user.subscription.status = subscription.status
            await user.save()
        } catch (error) {
            return next(new AppError("Failed to cancel subscription", 400))
        }

        const payment = await Payment.findOne({
            razorpay_subscription_id: subscriptionId
        })

        if (!payment) {
            return next(new AppError("No payment record found", 400))
        }

        const timeSinceSubscription = Date.now() - payment.createdAt
        const refundTime = 14 * 24 * 60 * 60 * 1000

        if (timeSinceSubscription >= refundTime) {
            return next(new AppError("Subscription cancelled after 14 days so there is no refund", 400))
        }

        await razorpay.payments.refund(payment.razorpay_payment_id, {
            speed: "optimum"
        })

        user.subscription.status = undefined
        user.subscription.id = undefined
        await user.save()

        await Payment.deleteOne({
            razorpay_subscription_id: subscriptionId
        })

        res.status(200).json({
            success: true,
            message: "Subscription cancelled successfully"
        })
    } catch (error) {
        return next(new AppError(error.message, 400))
    }
}

const allPayments = async (req, res, next) => {
    try {
        const { count } = req.query

        const subscriptions = await razorpay.subscriptions.all({
            count: count || 10
        })

        res.status(200).json({
            success: true,
            subscriptions
        })
    } catch (error) {
        return next(new AppError(error.message, 400))
    }
}

export {
    getRazorpayApiKey,
    buySubscription,
    verifySubscription,
    cancelSubscription,
    allPayments
}

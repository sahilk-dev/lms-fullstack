import { Webhook } from "svix";
import User from "../models/User.js";
import stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";
import AppError from "../utils/AppError.js";


// Clerk Webhook
export const clerkWebhooks = async (req, res, next) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          imageUrl: data.image_url,
          resume: ""
        };

        await User.findOneAndUpdate(
          { _id: data.id },
          { $setOnInsert: userData },
          {
            upsert: true,
            new: true
          }
        );

        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          imageUrl: data.image_url
        };

        await User.findByIdAndUpdate(data.id, userData);

        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);

        break;
      }

      default:
        console.log(`Unhandled Clerk event type: ${type}`);
    }

    return res.status(200).json({
      success: true,
      received: true
    });

  } catch (error) {
    next(error);
  }
};


// Stripe Gateway Initialize
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);


// Stripe Webhook
export const stripeWebhooks = async (request, response, next) => {
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return next(
      new AppError(
        "Webhook signature verification failed",
        400,
        "WEBHOOK_SIGNATURE_INVALID"
      )
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
          limit: 1
        });

        if (!session.data.length) {
          throw new AppError(
            "Checkout session not found",
            404,
            "CHECKOUT_SESSION_NOT_FOUND"
          );
        }

        const purchaseId = session.data[0].metadata?.purchaseId;

        if (!purchaseId) {
          throw new AppError(
            "Purchase ID missing from checkout session",
            400,
            "PURCHASE_ID_MISSING"
          );
        }

        /*
         * Only a pending purchase may transition to completed.
         *
         * This makes repeated Stripe deliveries safe:
         *
         * pending → completed
         *
         * completed → no change
         */
        const purchaseData = await Purchase.findOneAndUpdate(
          {
            _id: purchaseId,
            status: "pending"
          },
          {
            $set: {
              status: "completed"
            }
          },
          {
            new: true
          }
        );

        if (!purchaseData) {
          const existingPurchase = await Purchase.findById(purchaseId);

          if (!existingPurchase) {
            throw new AppError(
              "Purchase not found",
              404,
              "PURCHASE_NOT_FOUND"
            );
          }

          if (existingPurchase.status === "completed") {
            return response.status(200).json({
              received: true,
              duplicate: true
            });
          }

          throw new AppError(
            "Purchase cannot be completed from its current state",
            409,
            "INVALID_PURCHASE_STATE"
          );
        }

        const userData = await User.findById(purchaseData.userId);

        if (!userData) {
          throw new AppError(
            "User associated with purchase not found",
            404,
            "PURCHASE_USER_NOT_FOUND"
          );
        }

        const courseData = await Course.findById(purchaseData.courseId);

        if (!courseData) {
          throw new AppError(
            "Course associated with purchase not found",
            404,
            "PURCHASE_COURSE_NOT_FOUND"
          );
        }

        /*
         * $addToSet prevents duplicate enrollment if the same
         * operation is attempted more than once.
         */
        await Course.findByIdAndUpdate(
          courseData._id,
          {
            $addToSet: {
              enrolledStudents: userData._id
            }
          }
        );

        await User.findByIdAndUpdate(
          userData._id,
          {
            $addToSet: {
              enrolledCourses: courseData._id
            }
          }
        );

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
          limit: 1
        });

        if (!session.data.length) {
          throw new AppError(
            "Checkout session not found",
            404,
            "CHECKOUT_SESSION_NOT_FOUND"
          );
        }

        const purchaseId = session.data[0].metadata?.purchaseId;

        if (!purchaseId) {
          throw new AppError(
            "Purchase ID missing from checkout session",
            400,
            "PURCHASE_ID_MISSING"
          );
        }

        /*
         * Only pending purchases may transition to failed.
         *
         * This prevents a later duplicate failure event from
         * modifying an already completed purchase.
         */
        const purchaseData = await Purchase.findOneAndUpdate(
          {
            _id: purchaseId,
            status: "pending"
          },
          {
            $set: {
              status: "failed"
            }
          },
          {
            new: true
          }
        );

        if (!purchaseData) {
          const existingPurchase = await Purchase.findById(purchaseId);

          if (!existingPurchase) {
            throw new AppError(
              "Purchase not found",
              404,
              "PURCHASE_NOT_FOUND"
            );
          }

          return response.status(200).json({
            received: true,
            duplicate: true
          });
        }

        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return response.status(200).json({
      received: true
    });

  } catch (error) {
    next(error);
  }
};
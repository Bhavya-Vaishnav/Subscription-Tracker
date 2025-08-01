import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subscription name is required"],
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    price: {
      type: Number,
      required: [true, "Subscription price is required"],
      min: [0, "Price must be greaater than 0"],
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "RUPEE", "GBP"],
    },
    frequency: {
      type: String,
      enum: ["yearly", "monthly", "daily"],
    },
    category: {
      type: String,
      enum: ["sports", "entertainment", "music", "lifestyle", "technology"],
    },

    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "cancel", "expired"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value <= new Date(),
        message: "The starting date must be in past",
      },
    },
    renewalDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "The starting date must be in past",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

//Auto-calculate renewal date if missing.
subscriptionSchema.pre("save", function (next) {
  if (!this.renewalDate) {
    const renewalPeriods = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365,
    };

    this.renewalDate = new Date(this.startDate);
    this.renewalDate.setDate(
      this.renewalDate.getDate() + renewalPeriods[this.frequency]
    );

    //Auto-update status if renewal date has passed
    if (this.renewalDate < new Date()) {
      this.status = "expired";
    }

    next();
  }
});

const Subscription = new mongoose.model("Subscription", subscriptionSchema);

export default Subscription;

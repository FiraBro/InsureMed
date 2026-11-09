import mongoose from "mongoose";
import { PLAN_TYPES } from "../constants/planTypes.js";
import { STATUS_CODES } from "../constants/statusCodes.js";

const insurancePlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },

    // PRICING & COST
    premium: { type: Number, required: true },
    coverageAmount: { type: Number, required: true },
    deductible: { type: Number, default: 500 }, // Added: Deductible amount

    // CURRENCY
    currency: { type: String, default: "USD" },

    // FREQUENCY
    premiumFrequency: {
      type: String,
      enum: ["monthly", "quarterly", "annually"],
      default: "monthly",
    },

    // DESCRIPTION & DETAILS
    description: { type: String },
    shortDescription: { type: String }, // Added: For card display
    coverage: { type: String }, // Added: Coverage summary text

    // CATEGORY & TAGS
    planType: {
      type: String,
      enum: Object.values(PLAN_TYPES),
      default: PLAN_TYPES.INDIVIDUAL,
    },
    category: {
      type: String,
      default: "Health Insurance",
    },
    tags: [{ type: String }], // Added: For filtering/searching

    // FEATURES
    features: [
      {
        type: String,
      },
    ], // Added: Array of key features

    // RATINGS & REVIEWS
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5,
    },
    reviews: {
      type: Number,
      default: 100,
    },

    // PLAN LIMITS
    maxMembers: {
      type: Number,
      default: 1,
    }, // Added: Max people covered
    minAge: { type: Number, default: 18 },
    maxAge: { type: Number, default: 65 },

    // NETWORK INFORMATION
    networkSize: {
      type: String,
      default: "1000+ hospitals",
    },

    // WAITING PERIODS
    waitingPeriod: {
      type: String,
      default: "30 days",
    },

    // BONUS & DISCOUNTS
    renewalBonus: {
      type: String,
    }, // Added: e.g., "10% No Claim Bonus"
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },

    // POPULARITY & VISIBILITY
    isPopular: {
      type: Boolean,
      default: false,
    }, // Added: For highlighting
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // STATUS
    status: {
      type: String,
      enum: Object.values(STATUS_CODES),
      default: STATUS_CODES.PUBLISHED,
    },
    isDeleted: { type: Boolean, default: false },

    // META INFORMATION
    icon: { type: String }, // Added: Icon name/URL
    colorScheme: {
      type: String,
      default: "blue",
    }, // Added: For UI theming

    // EXCLUSIONS
    exclusions: [
      {
        type: String,
      },
    ], // Added: What's not covered

    // CLAIM INFORMATION
    claimSettlementRatio: {
      type: Number,
      min: 0,
      max: 100,
    }, // Added: Claim success percentage
    averageClaimTime: {
      type: Number,
    }, // Added: In days

    // DOCUMENTS
    documents: [
      {
        name: String,
        url: String,
        type: String,
      },
    ], // Added: PDFs, brochures

    // SEO & MARKETING
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: [{ type: String }],

    // CREATOR INFORMATION
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    riskScore: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
      },
      recommendations: [
        {
          type: String,
        },
      ],
    },

    // VALIDITY
    validityPeriod: {
      type: Number,
      default: 365,
    }, // Added: Plan validity in days
  },
  { timestamps: true }
);

// Enhanced Indexes
insurancePlanSchema.index({ slug: 1 });
insurancePlanSchema.index({ isDeleted: 1 });
insurancePlanSchema.index({ status: 1 });
insurancePlanSchema.index({ premium: 1 });
insurancePlanSchema.index({ rating: -1 }); // Added: For sorting by rating
insurancePlanSchema.index({ isPopular: 1 }); // Added: For popular plans
insurancePlanSchema.index({ isFeatured: 1 }); // Added: For featured plans
insurancePlanSchema.index({ planType: 1 }); // Added: For filtering by type
insurancePlanSchema.index({ category: 1 }); // Added: For filtering by category
insurancePlanSchema.index({ tags: 1 }); // Added: For tag-based searches
insurancePlanSchema.index({ premiumFrequency: 1 }); // Added: For frequency filtering
insurancePlanSchema.index({ createdAt: -1 }); // Added: For recent plans

// Virtual for annual premium calculation
insurancePlanSchema.virtual("annualPremium").get(function () {
  if (this.premiumFrequency === "monthly") {
    return this.premium * 12;
  } else if (this.premiumFrequency === "quarterly") {
    return this.premium * 4;
  }
  return this.premium; // already annual
});

// Set toJSON to include virtuals
insurancePlanSchema.set("toJSON", { virtuals: true });
insurancePlanSchema.set("toObject", { virtuals: true });

export default mongoose.model("Plan", insurancePlanSchema);

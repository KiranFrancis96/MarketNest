import mongoose from "mongoose";

const basicInformationSchema = new mongoose.Schema(
    {
        firstName: String,
        lastName: String,
        dateOfBirth: Date,
        gender: String,
        maritalStatus: String,
        occupation: String,
        education: String,
        languages: [String],
    },
    { _id: false }
);

const lifestyleSchema = new mongoose.Schema(
    {
        exerciseFrequency: String,
        wakeUpTime: String,
        sleepTime: String,
        dietType: String,
        smoking: Boolean,
        alcohol: Boolean,
        shoppingFrequency: String,
        workStyle: String,
    },
    { _id: false }
);

const familySchema = new mongoose.Schema(
    {
        livingAlone: Boolean,
        familyMembers: Number,
        children: Number,
        dependents: Number,
        pets: [String],
    },
    { _id: false }
);

const homeSchema = new mongoose.Schema(
    {
        houseType: String,
        ownership: String,
        bedrooms: Number,
        vehicles: [String],
        smartHomeDevices: [String],
    },
    { _id: false }
);

const shoppingSchema = new mongoose.Schema(
    {
        favoriteBrands: [String],
        favoriteCategories: [String],
        shoppingBudget: String,
        couponUsage: Boolean,
        cashbackInterest: Boolean,
        preferredShoppingTime: String,
    },
    { _id: false }
);

const privacySchema = new mongoose.Schema(
    {
        allowPersonalization: {
            type: Boolean,
            default: true,
        },
        allowAnalytics: {
            type: Boolean,
            default: true,
        },
        allowMarketing: {
            type: Boolean,
            default: false,
        },
        allowAiLearning: {
            type: Boolean,
            default: true,
        },
    },
    { _id: false }
);

const userProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        basicInformation: {
            type: basicInformationSchema,
            default: {},
        },

        lifestyle: {
            type: lifestyleSchema,
            default: {},
        },

        family: {
            type: familySchema,
            default: {},
        },

        home: {
            type: homeSchema,
            default: {},
        },

        shopping: {
            type: shoppingSchema,
            default: {},
        },

        privacy: {
            type: privacySchema,
            default: {},
        },

        completionPercentage: {
            type: Number,
            default: 0,
        },

        rewardCoins: {
            type: Number,
            default: 0,
        },

        completedSections: {
            type: [String],
            default: [],
        },

        currentSection: {
            type: String,
            default: "basicInformation",
        },
    },
    {
        timestamps: true,
    }
);

export const UserProfileModel = mongoose.model(
    "UserProfile",
    userProfileSchema,
    "userProfiles"
);
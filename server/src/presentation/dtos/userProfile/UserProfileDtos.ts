import { z } from "zod";

export const BasicInformationSchema = z.object({
    dateOfBirth: z.string().optional(),

    gender: z.enum([
        "male",
        "female",
        "other",
        "prefer_not_to_say",
    ]).optional(),

    maritalStatus: z.string().optional(),

    occupation: z.string().optional(),

    occupationType: z.string().optional(),

    education: z.string().optional(),

    languages: z.array(z.string()).optional(),
});

export const LifestyleSchema = z.object({
    exerciseFrequency: z.string().optional(),

    wakeUpTime: z.string().optional(),

    sleepTime: z.string().optional(),

    dietType: z.string().optional(),

    smoking: z.boolean().optional(),

    alcohol: z.boolean().optional(),

    shoppingFrequency: z.string().optional(),

    workStyle: z.string().optional(),
});

export const FamilySchema = z.object({
    livingAlone: z.boolean().optional(),

    familyMembers: z.number().optional(),

    children: z.number().optional(),

    dependents: z.number().optional(),

    pets: z.array(z.string()).optional(),
});

export const HomeSchema = z.object({
    houseType: z.string().optional(),

    ownership: z.string().optional(),

    bedrooms: z.number().optional(),

    vehicles: z.array(z.string()).optional(),

    smartHomeDevices: z.array(z.string()).optional(),
});

export const OccupationSchema = z.object({
    companyIndustry: z.string().optional(),

    jobRole: z.string().optional(),

    yearsExperience: z.number().optional(),

    workLocation: z.string().optional(),

    skills: z.array(z.string()).optional(),
});

export const ShoppingSchema = z.object({
    favoriteBrands: z.array(z.string()).optional(),

    favoriteCategories: z.array(z.string()).optional(),

    shoppingBudget: z.string().optional(),

    couponUsage: z.boolean().optional(),

    cashbackInterest: z.boolean().optional(),

    preferredShoppingTime: z.string().optional(),
});

export const TechnologySchema = z.object({
    primaryDevice: z.string().optional(),

    operatingSystem: z.string().optional(),

    techSavviness: z.string().optional(),

    favoriteGadgets: z.array(z.string()).optional(),
});

export const TravelSchema = z.object({
    travelFrequency: z.string().optional(),

    preferredDestination: z.string().optional(),

    accommodationStyle: z.string().optional(),

    passportStatus: z.boolean().optional(),
});

export const FoodSchema = z.object({
    dietaryPreferences: z.array(z.string()).optional(),

    favoriteCuisines: z.array(z.string()).optional(),

    cookingFrequency: z.string().optional(),

    diningOutFrequency: z.string().optional(),
});

export const EntertainmentSchema = z.object({
    favoriteGenres: z.array(z.string()).optional(),

    streamingServices: z.array(z.string()).optional(),

    hobbies: z.array(z.string()).optional(),

    weeklyScreenTime: z.string().optional(),
});

export const AiPreferencesSchema = z.object({
    aiFeatureUsage: z.string().optional(),

    preferredAiStyle: z.string().optional(),

    dataSharingConsent: z.boolean().optional(),

    automatedRecommendations: z.boolean().optional(),
});

export const PrivacySchema = z.object({
    allowPersonalization: z.boolean().optional(),

    allowAnalytics: z.boolean().optional(),

    allowMarketing: z.boolean().optional(),

    allowAiLearning: z.boolean().optional(),
});

export const CreateUserProfileRequestSchema = z.object({
    body: z.object({
        basicInformation: BasicInformationSchema,
    }),
});

export const UpdateUserProfileRequestSchema = z.object({
    body: z.object({
        basicInformation: BasicInformationSchema.optional(),

        lifestyle: LifestyleSchema.optional(),

        family: FamilySchema.optional(),

        home: HomeSchema.optional(),

        occupation: OccupationSchema.optional(),

        shopping: ShoppingSchema.optional(),

        technology: TechnologySchema.optional(),

        travel: TravelSchema.optional(),

        food: FoodSchema.optional(),

        entertainment: EntertainmentSchema.optional(),

        aiPreferences: AiPreferencesSchema.optional(),

        privacy: PrivacySchema.optional(),
    }).refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one section must be provided.",
        }
    ),
});

export type CreateUserProfileRequest =
    z.infer<typeof CreateUserProfileRequestSchema>;

export type UpdateUserProfileRequest =
    z.infer<typeof UpdateUserProfileRequestSchema>;
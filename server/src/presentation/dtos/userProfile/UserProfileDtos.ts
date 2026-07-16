import { z } from "zod";

export const CreateUserProfileRequestSchema = z.object({
    body: z.object({
        basicInformation: z.object({
            dateOfBirth: z.string(),
            gender: z.enum([
                "male",
                "female",
                "other",
                "prefer_not_to_say",
            ]),
            occupation: z.string().min(1),
            education: z.string().optional(),
            maritalStatus: z.string().optional(),
        }),
    }),
});

export type CreateUserProfileRequest =
    z.infer<typeof CreateUserProfileRequestSchema>;
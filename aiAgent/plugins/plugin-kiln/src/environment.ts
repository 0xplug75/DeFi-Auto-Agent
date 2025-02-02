import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const kilnEnvSchema = z.object({
    KILN_API_KEY: z.string().min(1, "Kiln API key is required"),
});

export type kilnConfig = z.infer<typeof kilnEnvSchema>;

export async function validateKilnConfig(
    runtime: IAgentRuntime
): Promise<kilnConfig> {
    try {
        const config = {
            KILN_API_KEY: runtime.getSetting("KILN_API_KEY"),
        };
        console.log('config: ', config)
        return kilnEnvSchema.parse(config);
    } catch (error) {
        console.log("error::::", error)
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Kiln API configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}

export const cookieEnvSchema = z.object({
    COOKIE_API_KEY: z.string().min(1, "Cookie API key is required"),
});

export type cookieConfig = z.infer<typeof cookieEnvSchema>;

export async function validateCookieConfig(
    runtime: IAgentRuntime
): Promise<cookieConfig> {
    try {
        const config = {
            COOKIE_API_KEY: runtime.getSetting("COOKIE_API_KEY"),
        };
        console.log('config: ', config)
        return cookieEnvSchema.parse(config);
    } catch (error) {
        console.log("error::::", error)
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Cookie API configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}

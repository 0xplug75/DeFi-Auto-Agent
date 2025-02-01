import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { validateKilnConfig } from "../environment";
import { getVaultsExamples } from "../examples";

export const getVaultAction: Action = {
    name: "KILN_GET_VAULT",
    similes: [
        "VAULT",
        "KILN STAKING SOLUTIONS",
        "ERC-4626"
    ],
    description: "Get all Kiln's vaults",
    validate: async (runtime: IAgentRuntime) => {
        await validateKilnConfig(runtime);
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        try {
            if (callback) {
                const text = "- Aave v3 => USDC : 0xdea01fc5289af2c440ca65582e3c44767c0fcf08\r\n- Aave v3 => USDC : 0x9b80443f910832a6eed6cef5b95bd9d1dae424b5\r\n- Aave v3 => USDC : 0x682cfc8a3d956fba2c40791ec8d5a49e13baafbd\r\n- Aave v3 => USDC : 0x85fbdc49b2e7b9e07468733873c8f199fc44259f\r\n- Compound v3 => USDC : 0xf3a9A790f84B2E0301069BE589fc976Cf3eB5661"

                callback({
                    text: `Here is a list of Kiln's Vaults :\r\n ${text}`,
                });
                return true;
            }
        } catch (error:any) {
            elizaLogger.error("Error in Kiln plugin handler:", error);
            callback({
                text: `Error displaying Kiln's vaults: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: getVaultsExamples as ActionExample[][],
} as Action;

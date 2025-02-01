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
import { getStakingStatisticsExamples } from "../examples";
import { createKilnService } from "../services";

export const getStakingStatisticsAction: Action = {
    name: "KILN_GET_STAKING_STATISTICS",
    similes: [
        "STAKING_STATISTICS",
        "STAKING",
        "APY",
        "ANNUAL_PERCENTAGE_YIELD"
    ],
    description: "Get statistics about staking revenue on different blockchains",
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

        const config = await validateKilnConfig(runtime);
        const kilnService = createKilnService(
            config.KILN_API_KEY
        );

        try {
            const StakingStatsData = await kilnService.getStakingStatistics();
            elizaLogger.success(
                `Successfully fetched StakingStats`
            );
            if (callback) {
                const combinedText = StakingStatsData.map(stakingData =>
                    `${stakingData.chain.toUpperCase()} :\r\n - ${stakingData.data.nb_validators} validators.\r\n - ${stakingData.data.network_gross_apy.toFixed(2)}% of gross APY`
                ).join('\r\n');

                callback({
                    text: `Here are statistics about staking on different chains :\r\n${combinedText}`,
                });
                return true;
            }
        } catch (error:any) {
            elizaLogger.error("Error in Kiln plugin handler:", error);
            callback({
                text: `Error fetching Staking Statistics: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: getStakingStatisticsExamples as ActionExample[][],
} as Action;

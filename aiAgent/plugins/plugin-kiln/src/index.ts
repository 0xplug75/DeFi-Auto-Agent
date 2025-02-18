import { Plugin } from "@elizaos/core"
import { getStakingStatisticsAction } from "./actions/getStakingStats"
import { getVaultAction } from "./actions/getVaults";
import { getTrendingAgentsAction } from "./actions/getTrendingAgents"

export const kilnPlugin: Plugin = {
    name: "kiln",
    description: "Kiln plugin for Eliza",
    actions: [getStakingStatisticsAction, getVaultAction, getTrendingAgentsAction],
    // evaluators analyze the situations and actions taken by the agent. they run after each agent action
    // allowing the agent to reflect on what happened and potentially trigger additional actions or modifications
    evaluators: [],
    // providers supply information and state to the agent's context, help agent access necessary data
    providers: [],
};
export default kilnPlugin;

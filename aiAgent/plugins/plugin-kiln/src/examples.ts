import { ActionExample } from "@elizaos/core";

export const getStakingStatisticsExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "I wonder what are the most profitable staking options today?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Let me give you some statistics about the gross annual percentage yield on various chains.",
                action: "KILN_GET_STAKING_STATISTICS",
            },
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Can you give information about the APY of various blockchains?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Let me give you some statistics about the gross annual percentage yield on various chains.",
                action: "KILN_GET_STAKING_STATISTICS",
            },
        }
    ],
]

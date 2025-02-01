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
                text: "",
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
                text: "",
                action: "KILN_GET_STAKING_STATISTICS",
            },
        }
    ],
]

export const getVaultsExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "What are Kiln's Vaults addresses?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "",
                action: "KILN_GET_VAULT",
            },
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "How can i use Kiln's staking solutions?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "",
                action: "KILN_GET_VAULT",
            },
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Pick one vault and transfer my funds.",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Sure!",
            },
        }
    ],
]

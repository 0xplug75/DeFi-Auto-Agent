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

export const getTrendingAgentsExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Who are the best AI Agent at the moment?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "",
                action: "COOKIE_GET_TRENDING",
            },
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "On which twitter agent should I invest?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "",
                action: "COOKIE_GET_TRENDING",
            },
        }
    ]
]

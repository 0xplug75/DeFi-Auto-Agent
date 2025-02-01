import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const API_KEY = "240f2017-0e5c-4653-af7e-5f93daaa913b";
    const API_URL_V1 = "https://api.cookie.fun/v1/kols";
    const API_URL_V2 = "https://api.cookie.fun/v2/agents/twitterUsername/cookiedotfun?interval=_7Days";

    try {
        const [responseV1, responseV2] = await Promise.all([
            fetch(API_URL_V1, { headers: { 'x-api-key': API_KEY } }),
            fetch(API_URL_V2, { headers: { 'x-api-key': API_KEY } })
        ]);
        
        if (!responseV1.ok || !responseV2.ok) {
            throw new Error(`API Error: ${responseV1.status} - ${responseV1.statusText} or ${responseV2.status} - ${responseV2.statusText}`);
        }

        const dataV1 = await responseV1.json();
        const dataV2 = await responseV2.json();
        
        return res.status(200).json({ ...dataV1, additionalData: dataV2 });
    } catch (error) {
        console.error("Error fetching data:", error);
        return res.status(500).json({ error: "Unable to fetch data" });
    }
}
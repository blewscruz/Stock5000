import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req) {
    try {
        const { messages } = await req.json();

        const result = streamText({
            model: openai('gpt-4o'),
            system: `You are a helpful and expert AI stock market assistant integrated into the 'Stock 5000' dashboard. 
Your goal is to help the user analyze stocks, understand market trends, and navigate the dashboard. 
Keep your answers concise, insightful, and formatted cleanly. You have basic awareness that the dashboard tracks AAPL, AMZN, NVDA, MSFT, BTC, and major S&P indices.`,
            messages,
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error('Chat API Error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Error communicating with AI provider.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

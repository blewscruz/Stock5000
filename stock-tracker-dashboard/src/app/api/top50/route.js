export const revalidate = 60; // Cache response for 60 seconds to prevent 429 Rate Limits from Yahoo Finance

export async function GET(request) {
    const top50Symbols = [
        'AAPL', 'MSFT', 'NVDA', 'AMZN', 'META', 'GOOGL', 'GOOG', 'BRK-B', 'LLY', 'AVGO',
        'JPM', 'TSLA', 'UNH', 'XOM', 'V', 'MA', 'JNJ', 'PG', 'HD', 'COST',
        'ABBV', 'MRK', 'BAC', 'CRM', 'CVX', 'NFLX', 'AMD', 'WMT', 'PEP', 'KO',
        'TMO', 'LIN', 'ADBE', 'MCD', 'DIS', 'WFC', 'CSCO', 'INTU', 'QCOM', 'AMGN',
        'IBM', 'TXN', 'AXP', 'CAT', 'PM', 'NOW', 'UBER', 'GE', 'SPGI', 'ISRG'
    ].join(',');

    const queryUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${top50Symbols}`;

    // Generate some plausible mock data in case the API fails
    const mockData = top50Symbols.split(',').map((sym, i) => ({
        symbol: sym,
        shortName: sym + ' Corp',
        regularMarketPrice: 100 + (Math.random() * 400),
        regularMarketChangePercent: (Math.random() * 6) - 3,
    }));

    try {
        const response = await fetch(queryUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            console.warn(`Yahoo Finance API returned ${response.status}. Falling back to mock data.`);
            return new Response(JSON.stringify(mockData), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await response.json();
        const results = data.quoteResponse?.result?.map(quote => ({
            symbol: quote.symbol,
            shortName: quote.shortName || quote.symbol,
            regularMarketPrice: quote.regularMarketPrice,
            regularMarketChangePercent: quote.regularMarketChangePercent,
        })) || mockData;

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Yahoo Finance API Error:", error);
        return new Response(JSON.stringify(mockData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

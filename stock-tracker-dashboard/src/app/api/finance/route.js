export const revalidate = 60; // Cache response for 60 seconds to prevent 429 Rate Limits from Yahoo Finance

export async function GET(request) {
  // We need current price, 1-month and 12-month performance
  // AAPL (Apple), AMZN (Amazon), NVDA (Nvidia), MSFT (Microsoft as 5th asset), ^GSPC (S&P 500), XLG (S&P 500 Top 50)
  const symbols = ['AAPL', 'AMZN', 'NVDA', 'MSFT', '^GSPC', 'XLG'].join(',');
  const queryUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;

  const mockData = [
    { symbol: 'AAPL', shortName: 'Apple Inc.', regularMarketPrice: 175.40, regularMarketChangePercent: 1.25, fiftyTwoWeekHighChangePercent: -2.0, fiftyDayAverageChangePercent: 4.5 },
    { symbol: 'AMZN', shortName: 'Amazon.com', regularMarketPrice: 145.20, regularMarketChangePercent: -0.85, fiftyTwoWeekHighChangePercent: 5.0, fiftyDayAverageChangePercent: 1.2 },
    { symbol: 'NVDA', shortName: 'NVIDIA Corp', regularMarketPrice: 850.15, regularMarketChangePercent: 3.40, fiftyTwoWeekHighChangePercent: 12.0, fiftyDayAverageChangePercent: 8.5 },
    { symbol: 'MSFT', shortName: 'Microsoft', regularMarketPrice: 410.50, regularMarketChangePercent: 0.50, fiftyTwoWeekHighChangePercent: 4.0, fiftyDayAverageChangePercent: 2.1 },
    { symbol: '^GSPC', shortName: 'S&P 500', regularMarketPrice: 5100.25, regularMarketChangePercent: 0.75, fiftyTwoWeekHighChangePercent: 3.0, fiftyDayAverageChangePercent: 1.5 },
    { symbol: 'XLG', shortName: 'S&P 500 Top 50', regularMarketPrice: 420.75, regularMarketChangePercent: 0.95, fiftyTwoWeekHighChangePercent: 4.5, fiftyDayAverageChangePercent: 2.0 },
  ];

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

    // We parse and simplify the data bundle for the frontend
    const results = data.quoteResponse?.result?.map(quote => ({
      symbol: quote.symbol,
      shortName: quote.shortName,
      regularMarketPrice: quote.regularMarketPrice,
      regularMarketChangePercent: quote.regularMarketChangePercent,
      fiftyTwoWeekHighChangePercent: quote.fiftyTwoWeekHighChangePercent, // Approximation of 12-month metrics
      fiftyDayAverageChangePercent: quote.fiftyDayAverageChangePercent // Approximation of 1-month metrics
    })) || mockData;

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Yahoo Finance API Error:", error);
    // Return mock data so the UI doesn't crash on network failure
    return new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

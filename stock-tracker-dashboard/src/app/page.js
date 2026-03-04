"use client";

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const fetchFinanceData = async () => {
  const stockRes = await fetch('/api/finance');
  const stocks = await stockRes.json();

  // Fetch Bitcoin directly using CoinGecko public API
  const btcRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
  const btcData = await btcRes.json();

  const top50Res = await fetch('/api/top50');
  const top50 = await top50Res.json();

  return {
    stocks,
    top50,
    crypto: {
      symbol: 'BTC',
      shortName: 'Bitcoin',
      regularMarketPrice: btcData.bitcoin.usd,
      regularMarketChangePercent: btcData.bitcoin.usd_24h_change,
    }
  };
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p className="text-muted">Acquiring Market Data...</p>
      </div>
    );
  }

  // Formatting utility
  const formatPrice = (price) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  const formatPercent = (percent) => `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`;

  // Merge stocks and crypto for mapping
  const allAssets = data ? [...data.stocks.filter(s => s.symbol !== '^GSPC' && s.symbol !== 'XLG'), data.crypto] : [];
  const benchmark = data ? data.stocks.find(s => s.symbol === '^GSPC') : null;
  const benchmarkTop50 = data ? data.stocks.find(s => s.symbol === 'XLG') : null;

  return (
    <div className="main-layout">
      <div className="dashboard-content dashboard-container animate-in">
        <header className="dashboard-header">
          <div>
            <h1 className="text-accent">Overview</h1>
            <p className="text-muted">Portfolio visual breakdown</p>
          </div>

          <div className="flex gap-4">
            <div className="benchmark-badge glass-panel">
              <span className="text-muted">S&P 500:</span>
              <strong>{benchmark ? formatPrice(benchmark.regularMarketPrice) : 'N/A'}</strong>
              <span className={benchmark?.regularMarketChangePercent > 0 ? "badge-positive" : "badge-negative"}>
                {benchmark ? formatPercent(benchmark.regularMarketChangePercent) : '0%'}
              </span>
            </div>

            <div className="benchmark-badge glass-panel">
              <span className="text-muted">S&P Top 50:</span>
              <strong>{benchmarkTop50 ? formatPrice(benchmarkTop50.regularMarketPrice) : 'N/A'}</strong>
              <span className={benchmarkTop50?.regularMarketChangePercent > 0 ? "badge-positive" : "badge-negative"}>
                {benchmarkTop50 ? formatPercent(benchmarkTop50.regularMarketChangePercent) : '0%'}
              </span>
            </div>
          </div>
        </header>

        <section className="assets-grid">
          {allAssets.map((asset) => (
            <div key={asset.symbol} className="asset-card glass-panel">
              <div className="card-header">
                <h2>{asset.shortName || asset.symbol}</h2>
                <span className="symbol text-muted">{asset.symbol}</span>
              </div>
              <div className="price-container">
                <div className="price">{formatPrice(asset.regularMarketPrice)}</div>
                <div className={`percent-change ${asset.regularMarketChangePercent > 0 ? 'positive' : 'negative'}`}>
                  {formatPercent(asset.regularMarketChangePercent)}
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="charts-container glass-panel mt-space">
          <h2>Index Comparison</h2>
          <p className="text-muted">S&P 500 vs. S&P 500 Top 50</p>
          <div className="chart-placeholder" style={{ height: '400px' }}>
            <Line
              data={{
                labels: ['12M Ago', '6M Ago', '1M Ago', 'Now'],
                datasets: [
                  {
                    label: 'S&P 500',
                    data: [
                      benchmark ? benchmark.regularMarketPrice * 0.8 : 4000,
                      benchmark ? benchmark.regularMarketPrice * 0.85 : 4200,
                      benchmark ? benchmark.regularMarketPrice * 0.95 : 4500,
                      benchmark?.regularMarketPrice || 4800
                    ],
                    borderColor: 'rgba(155, 161, 166, 0.4)',
                    tension: 0.4,
                    borderDash: [5, 5]
                  },
                  {
                    label: 'S&P Top 50 (XLG)',
                    data: [
                      benchmarkTop50 ? benchmarkTop50.regularMarketPrice * 0.75 : 300,
                      benchmarkTop50 ? benchmarkTop50.regularMarketPrice * 0.82 : 330,
                      benchmarkTop50 ? benchmarkTop50.regularMarketPrice * 0.92 : 390,
                      benchmarkTop50?.regularMarketPrice || 420
                    ],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.4
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                  x: { grid: { color: 'transparent' } }
                },
                plugins: {
                  legend: { labels: { color: '#f0f2f5' } }
                }
              }}
            />
          </div>
        </section>
      </div>

      <aside className="top-50-sidebar glass-panel animate-in">
        <div className="top-50-header">
          <h3>S&P 500 Top 50</h3>
        </div>
        <div className="top-50-list">
          {data?.top50?.map(stock => (
            <div key={stock.symbol} className="top-50-item">
              <div className="stock-info">
                <span className="stock-symbol">{stock.symbol}</span>
                <span className="stock-name" title={stock.shortName}>{stock.shortName}</span>
              </div>
              <div className="price-info">
                <span className="current-price">{formatPrice(stock.regularMarketPrice)}</span>
                <span className={`change-badge ${stock.regularMarketChangePercent > 0 ? 'positive' : 'negative'}`}>
                  {stock.regularMarketChangePercent > 0 ? '▲' : '▼'} {formatPercent(stock.regularMarketChangePercent)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

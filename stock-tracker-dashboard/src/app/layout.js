"use client";
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Stock Tracker App</title>
        <meta name="description" content="Personal dashboard to calmly monitor portfolio performance at a glance." />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

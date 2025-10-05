"use client";
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';
import CssBaseline from "@mui/material/CssBaseline";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
         <head>
        <link rel="icon" href="/favicon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon32.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <CssBaseline />
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
      </body>
    </html>
  );
}
  
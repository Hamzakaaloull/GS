// layout.js - Add preload and optimize fonts
"use client";
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';
import CssBaseline from "@mui/material/CssBaseline";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="img/favicon.png" />
        <link rel="icon" type="image/png" sizes='32x32' href="favicon/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="favicon/apple-touch-icon.png" />
        <meta name="theme-color" content="#ffffff" />
        <title>Gestion des Stagiaires</title>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Add loading strategy for LCP image */}
        <link rel="preload" href="/img/army.jpg" as="image" />
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
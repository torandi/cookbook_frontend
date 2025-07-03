import '@/app/ui/global.css'
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

import { roboto } from '@/app/ui/fonts';
import { theme } from '@/app/ui/theme';
import TopMenu from '@/app/ui/topmenu';

export const metadata: Metadata = {
  title: "Kokbok",
  description: "Receptdatabas",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: "1.0",
};

export default function RootLayout(
  { children, }: Readonly<{ children: React.ReactNode; }>
) {
  return (
    <html lang="en" className={roboto.variable} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" />
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <TopMenu/>
            <Container maxWidth="lg">
              {children}
            </Container>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

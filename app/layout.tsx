import '@/app/ui/global.css'
import type { Metadata, Viewport } from "next";
import { Suspense } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Fab from '@mui/material/Fab';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

import AddIcon from '@mui/icons-material/Add'

import { roboto } from '@/app/ui/fonts';
import { theme } from '@/app/ui/theme';
import TopMenu from '@/app/ui/topmenu';
import GlobalAlerts from '@/app/ui/global-alerts';
import AuthGuard from '@/app/auth-guard';
import Spinner from '@/app/components/spinner';

export const metadata: Metadata = {
	title: "Kokbok",
	description: "Receptdatabas",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
};

const AddMenuButton = () => {
	return (
		<Fab color="primary" className="fixed" sx={{bottom: 30, right: 30}}>
			<AddIcon/>
		</Fab>
	)
}

export default function RootLayout(
	{ children, }: Readonly<{ children: React.ReactNode; }>
) {
	/* suppressHydrationWarning is used to avoid hydration errors when using next/font with MUI */
	return (
		<html lang="en" className={roboto.variable} suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
				<link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
				<link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
				<link rel="manifest" href="/favicon/site.webmanifest" />
			</head>
			<body>
				<InitColorSchemeScript attribute="class" />
				<AppRouterCacheProvider options={{ enableCssLayer: true }}>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						<AuthGuard>
							<TopMenu/>
							<Container maxWidth="xl" sx={{my: 4}}>
								<Suspense fallback={<div><Spinner/></div>}>
								<GlobalAlerts />
									{children}
								</Suspense>
							</Container>
						</AuthGuard>
					</ThemeProvider>
				</AppRouterCacheProvider>
			</body>
		</html>
	);
}

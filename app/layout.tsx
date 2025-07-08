import '@/app/ui/global.css'
import type { Metadata, Viewport } from "next";
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

export const metadata: Metadata = {
	title: "Kokbok",
	description: "Receptdatabas",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: "1.0",
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
	return (
		<html lang="en" className={roboto.variable} suppressHydrationWarning>
			<body>
				<InitColorSchemeScript attribute="class" />
				<AppRouterCacheProvider options={{ enableCssLayer: true }}>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						<TopMenu/>
						<Container maxWidth="xl">
							{children}
						</Container>
						<AddMenuButton/>
					</ThemeProvider>
				</AppRouterCacheProvider>
			</body>
		</html>
	);
}

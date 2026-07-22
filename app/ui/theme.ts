'use client';
import { createTheme } from '@mui/material/styles';
import NextLink from 'next/link';

export const theme = createTheme({
	palette: {
		primary: {
			main: '#3b82f6',
			light: '#93c5fd',
			dark: '#1d4ed8',
			contrastText: '#ffffff',
		},
		secondary: {
			main: '#0ea5e9',
			light: '#bae6fd',
			dark: '#0369a1',
			contrastText: '#ffffff',
		},
		info: {
			main: '#38bdf8',
			light: '#e0f2fe',
			dark: '#0284c7',
			contrastText: '#0c4a6e',
		},
		background: {
			default: '#f8fbff',
			paper: '#ffffff',
		},
		action: {
			hover: '#eff6ff',
			selected: '#dbeafe',
			active: '#2563eb',
		},
	},
	typography: {
		fontFamily: 'var(--font-roboto)',
	},
	components: {
		MuiLink: {
			defaultProps: {
				component: NextLink
			}
		},
		MuiButtonBase: {
			defaultProps: {
				LinkComponent: NextLink
			}
		},
		MuiCard: {
			styleOverrides: {
				root: {
					border: '1px solid #dbeafe',
					boxShadow: '0 4px 14px rgba(14, 165, 233, 0.08)',
				},
			},
		}
	}
});

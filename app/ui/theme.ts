'use client';
import { createTheme } from '@mui/material/styles';
import NextLink from 'next/link';

export const theme = createTheme({
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
		}
	}
});

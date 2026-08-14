'use client';

import { useState } from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import Image from 'next/image';

import { useAuthState } from '../backend/auth';

type Page = {
  url: string;
  title: string;
  mobileVisible: boolean;
}

const pages: Page[] = [
  { url: '/recipe', title: 'Recept', mobileVisible: true },
  { url: '/recipe/add', title: 'Nytt recept', mobileVisible: true },
  { url: '/ingredients', title: 'Ingredienser', mobileVisible: false },
  { url: '/tags', title: 'Taggar', mobileVisible: false },
  { url: '/plan', title: 'Planering', mobileVisible: true },
]

export default function TopMenu() {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const isMobileMenuOpen = Boolean(menuAnchor);
  const isAuthenticated = useAuthState();

  const mobileVisiblePages = pages.filter((page) => page.mobileVisible);
  const mobileDropdownPages = pages.filter((page) => !page.mobileVisible);

  const openMobileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const closeMobileMenu = () => {
    setMenuAnchor(null);
  };

  return (
    <div>
      <AppBar position="static">
        <Container>
          <Toolbar
            sx={{
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              py: { xs: 1, md: 0 },
              gap: 1,
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', mr: 2, flexShrink: 0 }}>
              <Image src="/icon.png" alt="Cookbook icon" width={36} height={36} priority />
            </Box>

            { isAuthenticated && (
              <>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                  {/* large screen menu */}
                  <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                    {pages.map((page : Page) => (
                      <Button
                        key={page.url}
                        color="inherit"
                        href={page.url}
                      >
                        {page.title}
                      </Button>
                    ))}
                  </Box>

                  {/* small screen menu */}
                  <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 0.5 }}>
                    { /* hamburger dropdown */}
                    <IconButton
                      size="small"
                      aria-label="more menu items"
                      aria-controls={isMobileMenuOpen ? 'topmenu-mobile-menu' : undefined}
                      aria-haspopup="true"
                      aria-expanded={isMobileMenuOpen ? 'true' : undefined}
                      onClick={openMobileMenu}
                      color="inherit"
                    >
                      <MenuIcon />
                    </IconButton>

                    { /* mobile visible buttons */ }
                    {mobileVisiblePages.map((page: Page) => (
                      <Button
                        key={page.url}
                        color="inherit"
                        href={page.url}
                        size="small"
                      >
                        {page.title}
                      </Button>
                    ))}

                    { /* mobile dropdown menu */ }
                    <Menu
                      id="topmenu-mobile-menu"
                      anchorEl={menuAnchor}
                      open={isMobileMenuOpen}
                      onClose={closeMobileMenu}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                      keepMounted
                    >
                      {mobileDropdownPages.map((page: Page) => (
                        <MenuItem key={page.url}>
                          <Button
                            href={page.url}
                            onClick={closeMobileMenu}
                          >
                            {page.title}
                          </Button>
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                </Box>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  )
}


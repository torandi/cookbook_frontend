'use client';

import { useState, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { useRouter } from 'next/navigation';

import SearchBar from '@/app/ui/searchbar';
import { useRecipes } from '@/app/backend/recipe';

type Page = {
  url: string;
  title: string;
}

const pages: Page[] = [
  { url: '/recipe', title: 'Recept' },
  { url: '/recipe/add', title: 'Nytt recept' },
  { url: '/ingredients', title: 'Ingredienser' },
]

export default function TopMenu() {
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { recipes } = useRecipes();

  const filtered = searchQuery.trim()
    ? recipes.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 10)
    : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      setOpen(false);
      if (filtered.length === 1) {
        router.push(`/recipe/${filtered[0].id}`);
      } else {
        router.push(`/recipe?search=${encodeURIComponent(searchQuery)}`);
      }
      setSearchQuery('');
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleSelect = (id: number | null) => {
    setOpen(false);
    setSearchQuery('');
    router.push(`/recipe/${id}`);
  };

  return (
    <div>
      <AppBar position="static">
        <Container>
          <Toolbar>
            <Box sx={{ flexGrow: 1, display: 'flex' }}>
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
            <ClickAwayListener onClickAway={() => setOpen(false)}>
              <Box ref={wrapperRef} sx={{ position: 'relative' }}>
                <SearchBar
                  placeholder="Sök..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchQuery(e.target.value);
                    setOpen(true);
                  }}
                  onKeyDown={handleKeyDown}
                  inputProps={{ 'aria-label': 'search' }}
                />
                {open && filtered.length > 0 && (
                  <Paper
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      zIndex: 1300,
                      minWidth: 220,
                      maxHeight: 320,
                      overflow: 'auto',
                    }}
                  >
                    <MenuList>
                      {filtered.map(r => (
                        <MenuItem key={r.id} onClick={() => handleSelect(r.id)}>
                          {r.name}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Paper>
                )}
              </Box>
            </ClickAwayListener>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  )
}


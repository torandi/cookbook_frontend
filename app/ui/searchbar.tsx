'use client';

import { useState, useRef } from 'react';

import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { useRouter } from 'next/navigation';

import { useRecipes } from '@/app/backend/recipe';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

export default function SearchBar(props: React.ComponentProps<typeof InputBase>) {

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
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Box ref={wrapperRef} sx={{ position: 'relative' }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon/>
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Sök..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchQuery(e.target.value);
                  setOpen(true);
                }}
                onKeyDown={handleKeyDown}
                inputProps={{
                  'aria-label': 'search'
                }}
              />
            </Search>
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
  )
}

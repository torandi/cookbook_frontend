'use client';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

import SearchBar from '@/app/ui/searchbar';

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
            <SearchBar/>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  )
}


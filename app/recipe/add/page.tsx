import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function Page()
{
  return (
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Typography variant="h4" component="h1" sx={{mb: 2}}>Lägg till recept</Typography>
      </Box>
  )
}

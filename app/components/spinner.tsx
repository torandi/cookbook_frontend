import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function Spinner({ sx, className } : { sx?: any, className?: string }) {
  return (
    <Box sx={{ ...sx, display: 'flex' }} className={ className ?? "" }>
      <CircularProgress />
    </Box>
  );
}

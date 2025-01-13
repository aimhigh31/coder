import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                whiteSpace: 'nowrap'
              }}
            >
              NEXPLUS CODER 1.0
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Link href="/code" passHref style={{ textDecoration: 'none' }}>
                <Button 
                  color="inherit"
                  sx={{ 
                    color: 'white',
                    fontWeight: router.pathname === '/code' ? 'bold' : 'normal',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  variant={router.pathname === '/code' ? 'outlined' : 'text'}
                >
                  CODE
                </Button>
              </Link>
              <Link href="/bom" passHref style={{ textDecoration: 'none' }}>
                <Button 
                  color="inherit"
                  sx={{ 
                    color: 'white',
                    fontWeight: router.pathname === '/bom' ? 'bold' : 'normal',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  variant={router.pathname === '/bom' ? 'outlined' : 'text'}
                >
                  BOM
                </Button>
              </Link>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5' }}>
        {children}
      </Box>
    </Box>
  );
} 
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Typography from '@mui/material/Typography';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <>
      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link href="/" passHref style={{ textDecoration: 'none' }}>
                <Button 
                  color="inherit"
                  sx={{ 
                    color: 'white',
                    backgroundColor: router.pathname === '/' ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }}
                >
                  CODE
                </Button>
              </Link>
              <Link href="/bom" passHref style={{ textDecoration: 'none' }}>
                <Button 
                  color="inherit"
                  sx={{ 
                    color: 'white',
                    backgroundColor: router.pathname === '/bom' ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }}
                >
                  BOM
                </Button>
              </Link>
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                ml: 'auto',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}
            >
              NEXPLUS CODER 1.0
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      {children}
    </>
  );
} 
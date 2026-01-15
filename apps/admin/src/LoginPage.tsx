import { Login, LoginForm } from 'react-admin';
import { Box, Typography, Card, CardContent } from '@mui/material';

const LoginPage = () => (
  <Login
    sx={{
      backgroundImage: 'radial-gradient(circle at 50% 14em, #313264 0%, #1a1a2e 60%, #0f0f1a 100%)',
      '& .RaLogin-card': {
        minWidth: 320,
      },
    }}
  >
    <Card sx={{ minWidth: 320, backgroundColor: 'background.paper' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 3,
          pb: 1,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.02em',
            textAlign: 'center',
          }}
        >
          Studio Elysian
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mt: 0.5,
          }}
        >
          Admin
        </Typography>
      </Box>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  </Login>
);

export default LoginPage;

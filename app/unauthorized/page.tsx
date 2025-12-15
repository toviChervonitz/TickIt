"use client";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Chip,
  Divider,
  Stack,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import {
  ShieldOutlined as ShieldIcon,
  ArrowBack as ArrowBackIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ROUTES } from '../config/routes';

export default function UnauthorizedPage() {
  const router = useRouter();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f766e 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: 40,
          left: 40,
          width: 128,
          height: 128,
          background: alpha('#14b8a6', 0.1),
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 40,
          right: 40,
          width: 160,
          height: 160,
          background: alpha('#06b6d4', 0.1),
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, px: 2 }}>
        <Paper
          elevation={24}
          sx={{
            p: { xs: 4, sm: 6 },
            textAlign: 'center',
            borderRadius: 4,
            bgcolor: alpha('#ffffff', 0.95),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha('#cbd5e1', 0.3)}`,
            position: 'relative'
          }}
        >
          <Box sx={{ position: 'relative', mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                background: 'linear-gradient(135deg, #ef4444 0%, #f43f5e 100%)',
                boxShadow: 3
              }}
            >
              <ShieldIcon sx={{ fontSize: 64, color: 'white' }} />
            </Avatar>

            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: '25%',
                width: 48,
                height: 48,
                bgcolor: alpha('#14b8a6', 0.2),
                borderRadius: '50%',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: '25%',
                width: 32,
                height: 32,
                bgcolor: alpha('#06b6d4', 0.2),
                borderRadius: '50%',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                animationDelay: '700ms'
              }}
            />
          </Box>

          <Chip
            label="ERROR 403"
            size="small"
            sx={{
              mb: 2,
              bgcolor: alpha('#ef4444', 0.1),
              color: '#dc2626',
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: '0.1em'
            }}
          />

          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: '#1e293b',
              mb: 2
            }}
          >
            Access Denied
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            sx={{
              color: '#475569',
              fontSize: '1.125rem',
              mb: 1,
              lineHeight: 1.6
            }}
          >
            You don't have permission to access this resource.
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 4
            }}
          >
            Please contact your administrator if you believe this is an error.
          </Typography>

          <Box
            sx={{
              width: 80,
              height: 4,
              background: 'linear-gradient(90deg, #14b8a6 0%, #06b6d4 100%)',
              borderRadius: 2,
              mx: 'auto',
              mb: 4
            }}
          />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 5 }}
          >
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push(ROUTES.LANDING)}
              sx={{
                bgcolor: '#475569',
                color: 'white',
                px: 3,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 500,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: '#334155',
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s'
                }
              }}
            >
              Go Back
            </Button>
          </Stack>

          <Divider sx={{ mb: 4 }} />

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
            sx={{ color: '#64748b' }}
          >
            <LockIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2">
              Secure Access Protected
            </Typography>
          </Stack>
        </Paper>
      </Container>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </Box>
  );
}
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '../../firebase';
import { setDoc, doc } from 'firebase/firestore';
import { 
  Box, Button, TextField, Typography, Paper, Container, 
  Avatar, InputAdornment, IconButton, Alert, Divider, Grid
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import ParticlesBackground from './ParticlesBackground';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
  backdropFilter: 'blur(10px)',
  background: 'rgba(255, 255, 255, 0.9)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));

function Register({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date(),
      });
      
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Grid container sx={{ height: '100vh' }}>
      {/* Left side - Branding */}
      <Grid item xs={12} md={6} 
        sx={{ 
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.dark',
          p: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.1,
            background: `url('/images/gastro-genie-bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '70%' }}>
          <Avatar 
            src="/images/gastro-genie-icon-1024-1024.png"
            sx={{ 
              width: 180, 
              height: 180, 
              mb: 4, 
              mx: 'auto',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              border: '4px solid white'
            }}
          />
          <Typography variant="h3" fontWeight="bold" sx={{ mb: 3 }}>
            GastroGenie
          </Typography>
          <Typography variant="h5" fontWeight="regular" sx={{ mb: 3 }}>
            Your AI-powered culinary companion
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Join our community of food enthusiasts and discover personalized recipe recommendations based on your preferences and dietary needs.
          </Typography>
        </Box>
      </Grid>

      {/* Right side - Register form */}
      <Grid item xs={12} md={6} sx={{ position: 'relative', overflow: 'hidden' }}>
        <ParticlesBackground />
        
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            position: 'relative',
            zIndex: 1
          }}
        >
          <StyledPaper elevation={24} sx={{ maxWidth: 450, width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" fontWeight="700" color="primary.main" align="center">
                Create Your Account
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 1 }}>
                Join GastroGenie and save your recipe discoveries
              </Typography>
            </Box>

            {success && (
              <Alert severity="success" sx={{ my: 2 }}>
                Account created successfully! You can now sign in.
              </Alert>
            )}

            <Box component="form" onSubmit={handleRegister} sx={{ mt: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              
              {error && (
                <Typography color="error" align="center" sx={{ mt: 2, p: 1, bgcolor: 'rgba(255,0,0,0.05)', borderRadius: 1 }}>
                  {error}
                </Typography>
              )}
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  py: 1.5, 
                  borderRadius: 2,
                  fontWeight: 600,
                  boxShadow: '0 4px 14px 0 rgba(76, 175, 80, 0.4)'
                }}
              >
                Create Account
              </Button>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ textAlign: 'center' }}>
              <Button 
                variant="text" 
                onClick={onSwitchToLogin}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'transparent'
                  }
                }}
              >
                Already have an account? Sign In
              </Button>
            </Box>
          </StyledPaper>
        </Box>
      </Grid>
    </Grid>
  );
}

export default Register;
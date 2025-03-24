// src/components/ChatInterface.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Container, Typography, TextField, Button, 
  Card, CardContent, CardMedia, CardActions, 
  Chip, Divider, Paper, IconButton, ThemeProvider,
  createTheme, CssBaseline, Grid, Avatar
} from '@mui/material';
import { Send, Restaurant, Timer, LocalFireDepartment, FitnessCenter, YouTube } from '@mui/icons-material';

// Create theme with light/dark mode
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4CAF50',
      light: '#8BC34A',
      dark: '#2E7D32',
    },
    secondary: {
      main: '#FF9800',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4CAF50',
      light: '#8BC34A',
      dark: '#2E7D32',
    },
    secondary: {
      main: '#FF9800',
    },
  },
});

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const chatboxRef = useRef(null);

  const theme = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: input }]);
    setLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input })
      });
      
      const data = await response.json();
      
      // Add bot responses (including LLM card and recipes)
      setMessages(prev => [
        ...prev,
        ...data.map(item => ({
          type: 'bot',
          content: item,
          isLlmCard: item.is_llm_card
        }))
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: { title: 'Error', description: 'Failed to get recipes. Please try again.' } 
      }]);
    }
    
    setLoading(false);
    setInput('');
  };

  // Render LLM recommendation card
  const renderLlmCard = (content) => (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        mb: 2,
        borderLeft: '4px solid',
        borderColor: 'primary.main',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #2a2d3a 0%, #1f2126 100%)' 
          : 'linear-gradient(135deg, #f5f7fa 0%, #e9edf2 100%)'
      }}
    >
      <Typography variant="h6" color="primary" gutterBottom>
        {content.title}
      </Typography>
      <Typography variant="body1">
        {content.description}
      </Typography>
    </Paper>
  );

  // Render recipe card
  const renderRecipeCard = (recipe) => (
    <Card elevation={3} sx={{ mb: 2, overflow: 'visible' }}>
      <CardContent>
        <Typography variant="h5" color="primary.main" gutterBottom>
          {recipe.title}
        </Typography>
        
        {recipe.img_url && (
          <CardMedia
            component="img"
            height="200"
            image={recipe.img_url}
            alt={recipe.title}
            sx={{ borderRadius: 2, mb: 2 }}
          />
        )}
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {recipe.Time && (
            <Chip 
              icon={<Timer />} 
              label={recipe.Time} 
              variant="outlined" 
              size="small"
            />
          )}
          {recipe.Calories && (
            <Chip 
              icon={<LocalFireDepartment />} 
              label={`${recipe.Calories} Cal`} 
              variant="outlined" 
              size="small"
            />
          )}
          {recipe.Protein && (
            <Chip 
              icon={<FitnessCenter />} 
              label={`${recipe.Protein}g Protein`} 
              variant="outlined" 
              size="small"
            />
          )}
        </Box>
        
        <Typography variant="body1" paragraph>
          {recipe.description}
        </Typography>
        
        <CardActions sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Button 
            variant="outlined" 
            startIcon={<Restaurant />}
            href={recipe.url}
            target="_blank"
            sx={{ flexGrow: {xs: 1, sm: 0} }}
          >
            View Recipe
          </Button>
          
          {recipe.youtube_video && (
            <Button
              variant="contained"
              color="error"
              startIcon={<YouTube />}
              href={recipe.youtube_video}
              target="_blank"
              sx={{ flexGrow: {xs: 1, sm: 0} }}
            >
              Watch Tutorial
            </Button>
          )}
        </CardActions>
      </CardContent>
    </Card>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <IconButton 
            onClick={() => setDarkMode(!darkMode)}
            sx={{ position: 'absolute', top: 16, right: 16 }}
          >
            {darkMode ? '🌞' : '🌙'}
          </IconButton>
          
          <Typography variant="h3" component="h1" gutterBottom>
            GastroGenie
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Your AI-powered culinary assistant
          </Typography>
        </Box>
        
        <Paper 
          elevation={4} 
          sx={{ 
            height: '70vh', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <Box 
            ref={chatboxRef}
            sx={{ 
              flex: 1, 
              overflowY: 'auto', 
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', my: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Welcome to GastroGenie!
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Ask me to find recipes, cooking tips, or meal ideas.
                </Typography>
                <Grid container spacing={1} justifyContent="center">
                  {['Healthy breakfast ideas', 'Pasta dishes', 'Vegetarian dinner', 'Quick lunch recipes']
                    .map((suggestion, i) => (
                      <Grid item key={i}>
                        <Chip 
                          label={suggestion} 
                          onClick={() => setInput(suggestion)}
                          sx={{ '&:hover': { bgcolor: 'primary.light', color: 'white' } }}
                        />
                      </Grid>
                    ))}
                </Grid>
              </Box>
            ) : (
              messages.map((msg, i) => (
                <Box 
                  key={i}
                  sx={{
                    maxWidth: '80%',
                    alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {msg.type === 'user' ? (
                    <Paper 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        borderTopRightRadius: 0
                      }}
                    >
                      <Typography>{msg.content}</Typography>
                    </Paper>
                  ) : (
                    msg.isLlmCard ? renderLlmCard(msg.content) : renderRecipeCard(msg.content)
                  )}
                </Box>
              ))
            )}
            
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[0, 1, 2].map(i => (
                    <Box
                      key={i}
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        animation: 'bounce 1.5s infinite',
                        animationDelay: `${i * 0.2}s`
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
          
          <Divider />
          
          <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask about recipes..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              InputProps={{
                sx: { borderRadius: 28 }
              }}
            />
            <Button 
              variant="contained" 
              color="primary"
              endIcon={<Send />}
              onClick={handleSendMessage}
              sx={{ 
                borderRadius: 28,
                px: 3,
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              Send
            </Button>
            <IconButton 
              color="primary"
              onClick={handleSendMessage}
              sx={{ 
                display: { xs: 'flex', sm: 'none' },
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }}
            >
              <Send />
            </IconButton>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default ChatInterface;
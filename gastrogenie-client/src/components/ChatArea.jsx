
import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Chip, Divider,
  CircularProgress, Paper, IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import MessageItem from './MessageItem';
import RecipeCardSkeleton from './RecipeCardSkeleton';

const suggestions = [
  "Quick dinner ideas with chicken",
  "Mediterranean desserts",
  "Vegetarian high-protein recipes",
  "Gluten-free breakfast ideas"
];

function ChatArea({ darkMode, useLlm }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatboxRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (chatboxRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatboxRef.current;
        setShowScrollTop(scrollTop < scrollHeight - clientHeight - 100);
      }
    };

    const chatbox = chatboxRef.current;
    if (chatbox) {
      chatbox.addEventListener('scroll', handleScroll);
      return () => chatbox.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTo({
        top: chatboxRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSendMessage(suggestion);
  };

  const handleSendMessage = async (text = query) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { type: 'user', content: text }];
    setMessages(newMessages);
    setQuery('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: text,
          use_llm: useLlm
        }),
      });
      
      const data = await response.json();
      
      // Delay to show skeleton effect
      setTimeout(() => {
        setMessages([
          ...newMessages,
          ...data.map(item => ({
            type: 'bot',
            content: item
          }))
        ]);
        setLoading(false);
      }, 1000); // 1 second delay to show skeleton
    } catch (error) {
      console.error('Error:', error);
      setMessages([
        ...newMessages,
        { 
          type: 'bot', 
          content: { 
            title: "Error", 
            description: "⚠️ Error fetching recipes. Please try again later.",
            is_error: true
          } 
        }
      ]);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        ml: { xs: '70px', md: '260px' },
        height: '100vh',
      }}
    >
      <Box
        ref={chatboxRef}
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          px: { xs: 2, md: 5 },
          pt: 4,
          pb: 12,
          position: 'relative',
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ 
            maxWidth: '800px', 
            margin: '0 auto', 
            pt: { xs: 4, md: 10 },
            textAlign: 'center' 
          }}>
            <Typography variant="h1" gutterBottom>
              Your Personal Culinary Assistant
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
              Discover recipes, get cooking advice, and find meal ideas tailored to your preferences and dietary needs.
            </Typography>
            
            <Box sx={{ mb: 5 }}>
              <Typography variant="h2" gutterBottom sx={{ fontSize: '1.1rem' }}>
                Try asking about:
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1, 
                justifyContent: 'center',
                mt: 2 
              }}>
                {suggestions.map((suggestion, idx) => (
                  <Chip
                    key={idx}
                    label={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    sx={{
                      borderRadius: '16px',
                      py: 1,
                      px: 1,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'white',
                      },
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
            {messages.map((message, index) => (
              <MessageItem key={index} message={message} darkMode={darkMode} />
            ))}
            
            {loading && (
              <Box sx={{ mt: 3 }}>
                <RecipeCardSkeleton useLlm={useLlm} />
                {!useLlm && <RecipeCardSkeleton />}
              </Box>
            )}
          </Box>
        )}
        
        {showScrollTop && (
          <IconButton
            onClick={scrollToBottom}
            sx={{
              position: 'fixed',
              bottom: 90,
              right: 20,
              bgcolor: 'background.paper',
              boxShadow: 3,
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white'
              }
            }}
          >
            <ArrowUpwardIcon />
          </IconButton>
        )}
      </Box>
      
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          left: { xs: '70px', md: '260px' },
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          zIndex: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          sx={{
            display: 'flex',
            gap: 2,
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask about recipes, ingredients, or cooking techniques..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            InputProps={{
              sx: {
                borderRadius: '12px',
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                '&:focus-within': {
                  boxShadow: `0 0 0 2px ${darkMode ? '#42a5f5' : '#1e88e5'}`,
                },
                border: 'none',
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: '12px',
              minWidth: '56px',
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default ChatArea;
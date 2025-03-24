import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Container, Paper, Typography, TextField, Button, 
  Chip, CircularProgress, Card, CardContent, CardMedia, 
  CardActions, Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import './ChatInterface.css';

const suggestions = [
  "Quick dinner ideas with chicken",
  "Tea",
  "Vegetarian salad",
  "Healthy meal prep ideas"
];

function ChatInterface({ darkMode }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useLlm, setUseLlm] = useState(false);
  const chatboxRef = useRef(null);

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

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
      
      setMessages([
        ...newMessages,
        ...data.map(item => ({
          type: 'bot',
          content: item
        }))
      ]);
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
    } finally {
      setLoading(false);
    }
  };

  const renderRecipeCard = (recipe) => {
    const isLlmCard = recipe.is_llm_card;
    
    return (
      <Card 
        className={isLlmCard ? "llm-card" : "recipe-card"}
        sx={{ 
          overflow: 'visible',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          borderRadius: 4,
          border: '1px solid',
          borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          ...(isLlmCard && {
            borderLeft: '4px solid #4a90e2',
            background: darkMode ? 
              'linear-gradient(135deg, #2a2d3a 0%, #1f2126 100%)' : 
              'linear-gradient(135deg, #f5f7fa 0%, #e9edf2 100%)'
          })
        }}
      >
        <CardContent>
          <Typography 
            variant="h3" 
            component="h3" 
            sx={{ 
              mb: 2,
              pb: 1,
              position: 'relative',
              '&::after': !isLlmCard ? {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '60px',
                height: '3px',
                bgcolor: 'primary.light',
                borderRadius: '3px'
              } : {}
            }}
          >
            {recipe.title}
          </Typography>
          
          {recipe.img_url && (
            <CardMedia
              component="img"
              image={recipe.img_url}
              alt={recipe.title}
              sx={{
                width: '90%',
                aspectRatio: '16/9',
                objectFit: 'cover',
                borderRadius: 3,
                my: 2,
                boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
              }}
            />
          )}
          
          {!isLlmCard && (
            <Box className="nutrition-facts" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 2 }}>
              {recipe.Time && (
                <Chip 
                  label={`⏱ ${recipe.Time}`}
                  sx={{ 
                    bgcolor: 'background.paper',
                    borderRadius: '30px',
                    py: 0.5,
                    px: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                />
              )}
              {recipe.Calories && (
                <Chip 
                  label={`🔥 ${recipe.Calories} Calories`}
                  sx={{ 
                    bgcolor: 'background.paper',
                    borderRadius: '30px',
                    py: 0.5,
                    px: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                />
              )}
              {recipe.Protein && (
                <Chip 
                  label={`💪 ${recipe.Protein}g Protein`}
                  sx={{ 
                    bgcolor: 'background.paper',
                    borderRadius: '30px',
                    py: 0.5,
                    px: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                />
              )}
            </Box>
          )}
          
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              lineHeight: 1.8,
              my: 2 
            }}
          >
            {recipe.description}
          </Typography>
          
          {!isLlmCard && (
            <CardActions sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, px: 0 }}>
              {recipe.url && (
                <Button
                  variant="outlined"
                  href={recipe.url}
                  target="_blank"
                  className="view-recipe"
                  startIcon={<span>📖</span>}
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: '30px',
                    py: 1,
                    px: 2,
                    color: 'text.primary',
                    fontWeight: 500,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                      color: 'primary.main'
                    }
                  }}
                >
                  View Full Recipe
                </Button>
              )}
              
              {recipe.youtube_video && (
                <Button
                  variant="contained"
                  href={recipe.youtube_video}
                  target="_blank"
                  className="youtube-link"
                  startIcon={<span>▶️</span>}
                  sx={{
                    background: 'linear-gradient(135deg, #FF0000, #CC0000)',
                    borderRadius: '30px',
                    py: 1,
                    px: 2,
                    color: 'white',
                    fontWeight: 500,
                    boxShadow: '0 4px 12px rgba(255,0,0,0.2)',
                    '&:hover': {
                      transform: 'translateY(-2px) scale(1.02)',
                      boxShadow: '0 6px 20px rgba(255,0,0,0.3)'
                    }
                  }}
                >
                  Watch Tutorial
                </Button>
              )}
            </CardActions>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Container sx={{ flex: 1, display: 'flex', flexDirection: 'column', mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Box className="toggle-container">
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={useLlm}
              onChange={() => setUseLlm(!useLlm)}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="toggle-label">
            {useLlm ? 'AI Explanations On' : 'Search Results Only'}
          </span>
        </Box>
      </Box>
    
      <Paper 
        id="chat-container"
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          p: { xs: 1.5, sm: 3 },
          maxHeight: '80vh'
        }}
      >
        <Box 
          id="chatbox"
          ref={chatboxRef}
          sx={{ 
            flex: 1,
            overflowY: 'auto',
            p: 2,
            scrollBehavior: 'smooth',
            maskImage: 'linear-gradient(to top, transparent, black 20px)',
            WebkitMaskImage: 'linear-gradient(to top, transparent, black 20px)',
          }}
        >
          {messages.length === 0 ? (
            <Box className="welcome-message" sx={{ textAlign: 'center', color: 'text.secondary', my: 4, animation: 'fadeIn 1s ease-out' }}>
              <Typography variant="h3" gutterBottom>
                👨‍🍳 How can I help you cook today?
              </Typography>
              <Typography variant="body1" paragraph>
                Ask me about any recipe, ingredient substitutions, cooking techniques, or dietary restrictions.
              </Typography>
              <Box className="suggestions" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3, justifyContent: 'center' }}>
                {suggestions.map((suggestion, i) => (
                  <Chip
                    key={i}
                    label={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    sx={{
                      bgcolor: 'background.default',
                      borderRadius: '30px',
                      py: 1,
                      px: 1.5,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'white',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          ) : (
            messages.map((message, index) => (
              <Box 
                key={index} 
                className={`message ${message.type}-message`}
                sx={{
                  my: 1.5,
                  maxWidth: '70%',
                  alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                  borderRadius: 3,
                  p: { xs: 1.25, sm: 2 },
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                  animation: 'fadeIn 0.3s ease-out',
                  position: 'relative',
                  bgcolor: message.type === 'user' ? 'primary.main' : 'background.default',
                  color: message.type === 'user' ? 'white' : 'text.primary',
                  ml: message.type === 'user' ? 'auto' : 0,
                  mr: message.type === 'user' ? 0 : 'auto',
                  borderTopRightRadius: message.type === 'user' ? 0 : 3,
                  borderTopLeftRadius: message.type === 'user' ? 3 : 0,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: 0,
                    height: 0,
                    borderStyle: 'solid',
                    borderWidth: '10px',
                    top: 0,
                    ...(message.type === 'user' 
                      ? {
                          borderColor: 'transparent transparent transparent #4CAF50',
                          right: '-10px'
                        }
                      : {
                          borderColor: 'transparent #f5f5f5 transparent transparent',
                          left: '-10px'
                        }
                    )
                  }
                }}
              >
                {message.type === 'user' ? (
                  <Typography>{message.content}</Typography>
                ) : (
                  renderRecipeCard(message.content)
                )}
              </Box>
            ))
          )}
          
          {loading && (
            <Box className="typing-dots" sx={{ display: 'flex', gap: 0.5, p: 1, justifyContent: 'center' }}>
              <Box className="dot" sx={{ 
                width: 10, 
                height: 10, 
                bgcolor: 'primary.light', 
                borderRadius: '50%', 
                animation: 'bounce 1.5s infinite'
              }} />
              <Box className="dot" sx={{ 
                width: 10, 
                height: 10, 
                bgcolor: 'primary.main', 
                borderRadius: '50%', 
                animation: 'bounce 1.5s infinite',
                animationDelay: '0.2s'
              }} />
              <Box className="dot" sx={{ 
                width: 10, 
                height: 10, 
                bgcolor: 'primary.dark', 
                borderRadius: '50%', 
                animation: 'bounce 1.5s infinite',
                animationDelay: '0.4s'
              }} />
            </Box>
          )}
        </Box>
        
        <Box 
          component="form" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          sx={{ 
            display: 'flex', 
            gap: 2, 
            mt: 2,
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="What would you like to cook today? (e.g., 'high protein Indian drink under 10 minutes')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            InputProps={{
              sx: {
                borderRadius: '50px',
                bgcolor: 'background.default',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                '&:focus-within': {
                  boxShadow: '0 0 0 3px #8BC34A'
                }
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            endIcon={<SendIcon />}
            sx={{
              borderRadius: '50px',
              py: 1,
              px: { xs: 2, sm: 3 },
              width: { xs: '100%', sm: 'auto' },
              '&:hover svg': {
                transform: 'translateX(3px)'
              }
            }}
          >
            {loading ? 'Searching...' : 'Send'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ChatInterface;
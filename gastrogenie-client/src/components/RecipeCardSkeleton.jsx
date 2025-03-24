
import React from 'react';
import { 
  Box, Card, CardContent, Skeleton, Divider 
} from '@mui/material';

function RecipeCardSkeleton({ useLlm }) {
  const isLlmCard = useLlm;
  
  return (
    <Box sx={{ animation: 'pulse 1.5s infinite' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
        <Skeleton variant="circular" width={36} height={36} />
        
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width={100} sx={{ mb: 1 }} />
          
          <Card
            elevation={0}
            sx={{
              overflow: 'hidden',
              borderRadius: 2,
              mb: 1,
              ...(isLlmCard && {
                borderLeft: '3px solid',
                borderColor: 'primary.main',
              })
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2 }} />
              
              {!isLlmCard && (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={200}
                  sx={{ borderRadius: 1, mb: 2 }}
                />
              )}
              
              {!isLlmCard && (
                <Box sx={{ display: 'flex', gap: 1, my: 2, flexWrap: 'wrap' }}>
                  <Skeleton variant="rounded" width={100} height={32} />
                  <Skeleton variant="rounded" width={120} height={32} />
                  <Skeleton variant="rounded" width={110} height={32} />
                </Box>
              )}
              
              <Box sx={{ mb: 2 }}>
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="90%" />
                {isLlmCard && (
                  <>
                    <Skeleton variant="text" width="95%" />
                    <Skeleton variant="text" width="85%" />
                  </>
                )}
              </Box>
              
              {!isLlmCard && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Skeleton variant="rounded" width={120} height={36} />
                  <Skeleton variant="rounded" width={150} height={36} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

export default RecipeCardSkeleton;
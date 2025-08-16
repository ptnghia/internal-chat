import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

// 404 Not Found handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  // Log the 404 request
  logger.warn('404 Not Found', {
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    timestamp: new Date().toISOString(),
  });

  // Send 404 response
  res.status(404).json({
    error: {
      message: `Cannot ${req.method} ${req.path}`,
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      suggestions: getSuggestions(req.path),
    },
  });
};

// Helper function to provide suggestions for similar endpoints
const getSuggestions = (path: string): string[] => {
  const suggestions: string[] = [];
  
  // Common API endpoints
  const commonEndpoints = [
    '/api/health',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/auth/refresh',
    '/api/users',
    '/api/users/me',
    '/api/chats',
    '/api/messages',
    '/api/tasks',
    '/api/files',
    '/api/notifications',
    '/api/departments',
    '/api/teams',
  ];

  // Find similar endpoints based on path similarity
  const pathParts = path.toLowerCase().split('/').filter(Boolean);
  
  for (const endpoint of commonEndpoints) {
    const endpointParts = endpoint.toLowerCase().split('/').filter(Boolean);
    
    // Check for partial matches
    const hasCommonParts = pathParts.some(part => 
      endpointParts.some(endpointPart => 
        endpointPart.includes(part) || part.includes(endpointPart)
      )
    );
    
    if (hasCommonParts) {
      suggestions.push(endpoint);
    }
  }

  // If no specific suggestions, provide general ones
  if (suggestions.length === 0) {
    if (path.startsWith('/api')) {
      suggestions.push('/api/health', '/api/auth/login', '/api/users/me');
    } else {
      suggestions.push('/api', '/health');
    }
  }

  // Limit to 3 suggestions
  return suggestions.slice(0, 3);
};

export default notFoundHandler;

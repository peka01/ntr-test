import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

// Map section IDs to actual file paths
function getActualFilePath(sectionId: string, language: string): string {
  const langFolder = language === 'sv' ? 'sv' : 'en';
  
  const pathMapping: Record<string, Record<string, string>> = {
    sv: {
      'overview': 'overview',
      'troubleshooting': 'troubleshooting',
      'vouchers': 'Användare/vouchers',
      'subscriptions': 'Användare/subscriptions',
      'attendance': 'Användare/attendance',
      'guided-tours': 'Användare/guided-tours',
      'news-announcements': 'Användare/news-announcements',
      'user-management': 'Administratör/user-management',
      'training-management': 'Administratör/training-management',
      'tour-management': 'Administratör/tour-management',
      'shoutout-management': 'Administratör/shoutout-management'
    },
    en: {
      'overview': 'overview',
      'troubleshooting': 'troubleshooting',
      'vouchers': 'User/vouchers',
      'subscriptions': 'User/subscriptions',
      'attendance': 'User/attendance',
      'guided-tours': 'User/guided-tours',
      'news-announcements': 'User/news-announcements',
      'user-management': 'Admin/user-management',
      'training-management': 'Admin/training-management',
      'tour-management': 'Admin/tour-management',
      'shoutout-management': 'Admin/shoutout-management'
    }
  };
  
  const mappedPath = pathMapping[langFolder]?.[sectionId];
  return mappedPath ? `${langFolder}/${mappedPath}.md` : `${langFolder}/${sectionId}.md`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Pragma');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only handle GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { section, lang = 'sv', source = 'github' } = req.query;
    
    if (!section || typeof section !== 'string') {
      return res.status(400).json({ error: 'Missing section parameter' });
    }

    const language = typeof lang === 'string' ? lang : 'sv';
    const sourceType = typeof source === 'string' ? source : 'github';
    const relativePath = getActualFilePath(section, language);

    if (sourceType === 'local') {
      // Load from local docs folder (built into the deployment)
      const filePath = path.join(process.cwd(), 'docs', relativePath);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return res.status(200).json({ 
          success: true, 
          content, 
          source: 'local',
          path: relativePath
        });
      } else {
        return res.status(404).json({ 
          success: false, 
          error: 'File not found',
          path: relativePath
        });
      }
    } else if (sourceType === 'github') {
      // Use GitHub API instead of raw.githubusercontent.com for instant updates
      const repoOwner = 'peka01';
      const repoName = 'ntr-test';
      const branch = 'main';
      
      // GitHub API endpoint - returns instant, uncached content
      const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/docs/${relativePath}?ref=${branch}`;
      
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3.raw', // Get raw content directly
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      };
      
      // Add authorization if token is available (increases rate limit)
      const githubToken = process.env.VITE_GITHUB_TOKEN;
      if (githubToken) {
        headers['Authorization'] = `Bearer ${githubToken}`;
      }
      
      const response = await fetch(apiUrl, {
        cache: 'no-store',
        headers
      });
      
      if (response.ok) {
        const content = await response.text();
        return res.status(200).json({ 
          success: true, 
          content, 
          source: 'github-api',
          path: relativePath
        });
      } else {
        return res.status(response.status).json({ 
          success: false, 
          error: `GitHub API request failed: ${response.status}`,
          path: relativePath
        });
      }
    } else {
      return res.status(400).json({ error: 'Invalid source parameter' });
    }
  } catch (error) {
    console.error('Help API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

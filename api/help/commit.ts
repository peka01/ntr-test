import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only handle POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sectionId, language, content, commitMessage, token } = req.body;

    if (!sectionId || !language || !content || !token) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Map section ID to file path
    function getActualFilePath(id: string, lang: string): string {
      const langFolder = lang === 'sv' ? 'sv' : 'en';
      
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
      
      const mappedPath = pathMapping[langFolder]?.[id];
      return mappedPath ? `docs/${langFolder}/${mappedPath}.md` : `docs/${langFolder}/${id}.md`;
    }

    const filePath = getActualFilePath(sectionId, language);
    const repoOwner = 'peka01';
    const repoName = 'ntr-test';

    // Get current file SHA if it exists
    const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    
    const getResponse = await fetch(getFileUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ntr-test-help-system'
      }
    });

    let sha: string | undefined;
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = (fileData as any).sha;
    }

    // Create or update the file
    const commitUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const commitData = {
      message: commitMessage || `Update ${filePath}`,
      content: Buffer.from(content).toString('base64'),
      sha: sha
    };

    const commitResponse = await fetch(commitUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'ntr-test-help-system'
      },
      body: JSON.stringify(commitData)
    });

    if (commitResponse.ok) {
      const result = await commitResponse.json();
      return res.status(200).json({ 
        success: true, 
        commit: result,
        path: filePath
      });
    } else {
      const errorText = await commitResponse.text();
      return res.status(commitResponse.status).json({ 
        success: false, 
        error: `GitHub commit failed: ${commitResponse.status}`,
        details: errorText
      });
    }
  } catch (error) {
    console.error('Commit API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

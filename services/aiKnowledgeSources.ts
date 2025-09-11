// Additional knowledge sources for the AI chatbot
// This file can be easily expanded to include more sources

export interface KnowledgeSource {
  name: string;
  content: string;
  keywords: string[];
  category: 'system' | 'business' | 'technical' | 'user-guide';
  priority: number; // Higher number = higher priority
}

export const additionalKnowledgeSources: KnowledgeSource[] = [
  {
    name: 'System Architecture',
    content: `The system is built with modern web technologies:
- Frontend: React 18 with TypeScript, using Tailwind CSS for styling
- Backend: Supabase (PostgreSQL database with real-time subscriptions)
- Authentication: Supabase Auth with role-based access control
- State Management: React Context API for global state
- Deployment: Docker containers with nginx reverse proxy`,
    keywords: ['architecture', 'system', 'react', 'typescript', 'supabase', 'postgresql', 'docker', 'nginx'],
    category: 'technical',
    priority: 10
  },
  {
    name: 'User Roles and Permissions',
    content: `The system has two main user roles:

Admin Users:
- Create and manage user accounts
- Manage voucher credits and balances
- Create, edit, and delete training sessions
- View attendance reports and statistics
- Access admin dashboard

Regular Users:
- Subscribe to training sessions
- Mark attendance for sessions
- View personal training history
- Manage personal voucher balance
- Cancel attendance (with credit refund)`,
    keywords: ['roles', 'admin', 'user', 'permissions', 'access', 'dashboard', 'reports'],
    category: 'system',
    priority: 9
  },
  {
    name: 'Training Session Management',
    content: `Training sessions are the core of the system:

Session Creation (Admin):
- Set title, description, date, time, and duration
- Define capacity limits and location
- Set voucher cost per session
- Configure cancellation policies

Session Management:
- Users can subscribe to available sessions
- Real-time capacity tracking
- Automatic voucher deduction on attendance
- Credit refunds for cancellations
- Attendance marking and verification`,
    keywords: ['training', 'sessions', 'subscription', 'attendance', 'capacity', 'cancellation', 'refund'],
    category: 'business',
    priority: 8
  },
  {
    name: 'Voucher and Credit System',
    content: `The voucher system manages user credits:

Credit Management:
- Users start with a voucher balance
- Credits are deducted when attending sessions
- Credits are refunded when cancelling attendance
- Admin can manually adjust balances
- Transaction history is maintained

Business Rules:
- Credits cannot go negative
- Refunds are processed immediately
- Credit transfers between users are possible
- Bulk credit purchases can be configured`,
    keywords: ['vouchers', 'credits', 'balance', 'deduction', 'refund', 'transactions', 'purchases'],
    category: 'business',
    priority: 8
  },
  {
    name: 'User Experience Features',
    content: `The system provides a modern, intuitive user experience:

Interface Features:
- Responsive design for all device sizes
- Dark/light theme support
- Multi-language support (Swedish/English)
- Real-time updates and notifications
- Drag-and-drop functionality for admins
- Search and filtering capabilities
- Subscriber count display on training cards
- Consistent card heights for uniform layout
- Action buttons positioned at bottom of cards

Training Card Features:
- Shows number of registered subscribers ("X anmälda" / "X registered")
- Uniform card heights across all training cards
- Edit and delete buttons at the bottom of each card
- Clean, organized layout with proper spacing

Attendance System:
- Check-in terminology throughout the application
- "Checka in" / "Check in" buttons instead of "Present"
- Real-time subscriber count updates
- Consistent terminology in Swedish and English`,
    keywords: ['ux', 'ui', 'responsive', 'accessibility', 'themes', 'languages', 'mobile', 'subscriber count', 'card height', 'uniform cards', 'action buttons', 'check in', 'checka in'],
    category: 'user-guide',
    priority: 7
  },
  {
    name: 'Data Security and Privacy',
    content: `Security is a top priority:

Data Protection:
- All data is encrypted in transit and at rest
- User passwords are securely hashed
- Role-based access control (RBAC)
- Audit logging for all actions
- GDPR compliance measures

Privacy Features:
- Users control their own data
- Automatic data retention policies
- Secure API endpoints
- Regular security audits
- Backup and disaster recovery`,
    keywords: ['security', 'privacy', 'encryption', 'gdpr', 'audit', 'backup', 'compliance'],
    category: 'system',
    priority: 9
  },
  {
    name: 'System Integration',
    content: `The system integrates with external services:

External Integrations:
- Payment gateways for credit purchases
- Email services for notifications
- SMS services for reminders
- Calendar integration (Google, Outlook)
- Reporting and analytics tools

API Access:
- RESTful API for external systems
- Webhook support for real-time updates
- OAuth 2.0 for third-party access
- Rate limiting and throttling
- Comprehensive API documentation`,
    keywords: ['integration', 'api', 'webhooks', 'oauth', 'payments', 'email', 'sms', 'calendar'],
    category: 'technical',
    priority: 6
  },
  {
    name: 'Latest UI Updates and Features',
    content: `Recent improvements to the user interface:

Subscriber Count Display:
- Training cards now show the number of registered subscribers
- Format: "X anmälda" (Swedish) / "X registered" (English)
- Updates in real-time when users subscribe/unsubscribe
- Visible on all training pages (admin, public, attendance)

Consistent Card Heights:
- All training cards now have uniform heights (256px minimum)
- Action buttons are vertically aligned across cards
- Better visual consistency and organization
- Responsive design maintained

Action Button Repositioning:
- Edit and delete buttons moved from header to bottom of cards
- Cleaner card layout with better information hierarchy
- Buttons separated from main content with subtle border
- Improved user experience and visual flow

Check-in Terminology Updates:
- Changed from "Present"/"Närvarande" to "Check in"/"Checka in"
- Consistent terminology across kiosk mode, attendance page, and welcome messages
- Better user understanding of the check-in process
- Updated in both Swedish and English languages

User Management Improvements:
- Removed explanatory note from user edit form
- Streamlined interface for user creation and editing
- Cleaner, more focused user management experience`,
    keywords: ['subscriber count', 'card height', 'uniform cards', 'action buttons', 'check in', 'checka in', 'ui updates', 'latest features', 'training cards', 'real-time updates'],
    category: 'user-guide',
    priority: 8
  },
  {
    name: 'Troubleshooting Common Issues',
    content: `Common problems and solutions:

User Issues:
- Can't log in: Check credentials and account status
- Session not appearing: Verify subscription and availability
- Credit not updating: Check transaction history and refresh
- Attendance marking failed: Verify session time and status

Admin Issues:
- User creation failed: Check email format and permissions
- Session editing blocked: Verify session hasn't started
- Report generation error: Check data permissions and format
- System performance: Monitor database connections and cache`,
    keywords: ['troubleshooting', 'errors', 'problems', 'solutions', 'debug', 'fix'],
    category: 'user-guide',
    priority: 7
  },
  {
    name: 'Tour System Overview',
    content: `The tour system provides interactive guided walkthroughs to help users learn the system:

Tour Features:
- Step-by-step guidance through system features
- Interactive elements with click, scroll, navigate, wait, and highlight actions
- Role-based access control (admin, user, or any user)
- Tour categories: onboarding, feature, admin, user
- Import/export functionality for tour management
- Tour statistics and analytics

Tour Step Types:
- Navigate: Moves user to specific pages
- Click: Highlights elements for user interaction
- Scroll: Shows content that's not visible
- Wait: Pauses tour for reading time
- Highlight: Draws attention to important elements

Tour Management (Admin):
- Create, edit, duplicate, and delete tours
- Configure step actions and target selectors
- Set tour categories and role requirements
- Import/export tours for backup and sharing
- View tour statistics and completion rates

User Experience:
- Tours can be started from news announcements
- Context-sensitive help integration
- Smooth transitions between steps
- Ability to skip, pause, or exit tours`,
    keywords: ['tour', 'guided tour', 'step', 'navigate', 'click', 'scroll', 'wait', 'highlight', 'guide', 'rundtur', 'guidad rundtur', 'steg', 'navigera', 'klicka', 'scrolla', 'vänta', 'markera', 'guida', 'tour management', 'create tour', 'edit tour', 'tour steps', 'tour statistics', 'tour import', 'tour export'],
    category: 'system',
    priority: 8
  },
  {
    name: 'Shoutout System Overview',
    content: `The shoutout system manages news announcements and feature highlights:

Shoutout Features:
- News announcements for new features and updates
- Feature highlights and improvements
- System notifications and important messages
- Priority levels: low, medium, high
- Expiration date management
- "New" indicator for unread messages
- Mark as read functionality

Shoutout Categories:
- Feature: New features or functionality
- Improvement: Enhancements to existing features
- Announcement: Important system notifications

Shoutout Management (Admin):
- Create, edit, duplicate, and delete shoutouts
- Set priority levels and expiration dates
- Link shoutouts to guided tours
- Import/export shoutouts for backup and sharing
- View read statistics and user engagement

User Experience:
- "New" indicators for unread messages
- Direct links to guided tours from announcements
- Automatic expiration of time-limited messages
- Integration with help system and AI assistant
- Context-sensitive information based on user role

Tour Integration:
- Shoutouts can link to guided tours
- Smooth transition from information to practical guidance
- Contextual help for new features
- Improved user onboarding experience`,
    keywords: ['shoutout', 'news', 'announcements', 'features', 'improvements', 'expire date', 'mark as read', 'new', 'nyheter', 'meddelanden', 'funktioner', 'förbättringar', 'utgångsdatum', 'markera som läst', 'nytt', 'shoutout management', 'create shoutout', 'edit shoutout', 'news items', 'feature announcements'],
    category: 'system',
    priority: 8
  }
];

// Helper function to get sources by category
export const getSourcesByCategory = (category: KnowledgeSource['category']): KnowledgeSource[] => {
  return additionalKnowledgeSources
    .filter(source => source.category === category)
    .sort((a, b) => b.priority - a.priority);
};

// Helper function to search sources by keyword
export const searchSourcesByKeyword = (keyword: string): KnowledgeSource[] => {
  const lowerKeyword = keyword.toLowerCase();
  return additionalKnowledgeSources
    .filter(source => 
      source.keywords.some(k => k.toLowerCase().includes(lowerKeyword)) ||
      source.content.toLowerCase().includes(lowerKeyword) ||
      source.name.toLowerCase().includes(lowerKeyword)
    )
    .sort((a, b) => b.priority - a.priority);
};

// Helper function to get all sources as formatted text
export const getAllSourcesAsText = (): string => {
  return additionalKnowledgeSources
    .sort((a, b) => b.priority - a.priority)
    .map(source => {
      return `### ${source.name}\n` +
             `Category: ${source.category}\n` +
             `Priority: ${source.priority}\n` +
             `Keywords: ${source.keywords.join(', ')}\n` +
             `${source.content}\n\n`;
    })
    .join('');
};

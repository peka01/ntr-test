# Training Management System - User Manual

## 📚 Table of Contents

- [Overview](#overview)
- [Key Concepts](#key-concepts)
- [For Administrators](#for-administrators)
- [For End Users](#for-end-users)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## Overview

The Training Management System is a comprehensive platform for managing training courses, user subscriptions, and attendance tracking. The system uses a voucher-based approach where users spend vouchers to attend training sessions.

### System Architecture

- **Frontend**: React application with TypeScript
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Anonymous access (configurable)
- **Real-time**: Live data synchronization

---

## Key Concepts

### 🎫 Voucher System

**What are vouchers?**
Vouchers are credits that users spend to attend training sessions. Each training session costs 1 voucher.

**How do vouchers work?**
- Users start with 0 vouchers (or a specified amount)
- Admins can add/remove vouchers from user accounts
- When a user attends a training, 1 voucher is deducted
- If attendance is cancelled, the voucher is refunded
- Vouchers cannot go below 0

### 👥 User Management

**User Types:**
- **Administrators**: Can manage users, trainings, and view all data
- **End Users**: Can subscribe to trainings and mark attendance

**User Information:**
- Name
- Email (unique identifier)
- Voucher balance
- Subscription history
- Attendance records

### 📚 Training Management

**Training Structure:**
- **Name**: Descriptive title of the training
- **Description**: Detailed information about the training content
- **Subscriptions**: Users who have signed up for the training
- **Attendance**: Users who have actually attended the training

**Training Lifecycle:**
1. Admin creates training
2. Users subscribe to training
3. Users attend training (vouchers deducted)
4. Attendance can be cancelled (vouchers refunded)

### 🔗 Relationships

**User ↔ Training Relationships:**
- **Subscription**: User is interested in attending (no voucher cost)
- **Attendance**: User has attended (voucher deducted)

**Important Notes:**
- Users can subscribe to multiple trainings
- Users can only attend trainings they're subscribed to
- Attendance requires available vouchers
- Cancelling attendance refunds the voucher

---

## For Administrators

### 🎯 Admin Dashboard Overview

The Admin Dashboard provides complete control over the training management system.

#### Navigation
- **Public View**: See what end users see
- **Attendance View**: Track attendance and manage vouchers
- **Admin View**: Full administrative control

### 👤 User Management

#### Creating Users

1. Navigate to **Admin** view
2. In the "Create User" section:
   - Enter the user's **full name**
   - Enter a **unique email address**
3. Click **"Create User"**
4. The user will be created with 0 vouchers

#### Managing Vouchers

**Adding Vouchers:**
1. Find the user in the user list
2. Click the **"+"** button next to their voucher balance
3. One voucher will be added to their account

**Removing Vouchers:**
1. Find the user in the user list
2. Click the **"-"** button next to their voucher balance
3. One voucher will be removed (if balance > 0)

**Best Practices:**
- Monitor voucher usage patterns
- Set up voucher allocation policies
- Consider bulk voucher distribution for teams

### 📚 Training Management

#### Creating Trainings

1. Navigate to **Admin** view
2. In the "Create Training" section:
   - Enter a **descriptive name** (e.g., "React Fundamentals")
   - Provide a **detailed description** of the training content
3. Click **"Create Training"**
4. The training will appear in the training list

#### Editing Trainings

1. Find the training in the training list
2. Click the **edit icon** (pencil)
3. Modify the name and/or description
4. Click **"Save"** to update

#### Training Best Practices

**Naming Conventions:**
- Use clear, descriptive names
- Include skill level if applicable (Beginner, Intermediate, Advanced)
- Consider adding dates for time-sensitive trainings

**Description Guidelines:**
- Include learning objectives
- List prerequisites
- Mention duration and format
- Specify target audience

### 📊 Monitoring and Analytics

#### Key Metrics to Track

**User Engagement:**
- Number of active users
- Voucher usage patterns
- Most popular trainings

**Training Effectiveness:**
- Subscription vs. attendance rates
- User feedback (if implemented)
- Completion rates

#### Data Export

Currently, data can be viewed in the Supabase dashboard:
1. Go to your Supabase project
2. Navigate to **Table Editor**
3. Select the relevant table (users, trainings, subscriptions, attendance)
4. Export data as needed

### 🔧 System Configuration

#### Environment Variables

The system uses these environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Anonymous access key
- `GEMINI_API_KEY`: For AI features (optional)

#### Database Management

**Backup Strategy:**
- Enable automated backups in Supabase
- Set up regular data exports
- Monitor storage usage

**Performance Optimization:**
- Database indexes are automatically created
- Monitor query performance in Supabase dashboard
- Consider implementing caching for large datasets

---

## For End Users

### 🎯 Getting Started

#### First Time Setup

1. **Access the System**: Open the Training Management System in your browser
2. **View Available Trainings**: Navigate to the **Public** view
3. **Check Your Vouchers**: Your voucher balance is displayed in the interface
4. **Subscribe to Trainings**: Click "Subscribe" on trainings you're interested in

#### Understanding the Interface

**Navigation Tabs:**
- **Public**: Browse and subscribe to trainings
- **Attendance**: Mark your attendance at trainings
- **Admin**: Administrative functions (if you have access)

### 📚 Training Subscriptions

#### Subscribing to Trainings

1. Go to the **Public** view
2. Browse available trainings
3. Click **"Subscribe"** next to trainings you want to attend
4. You can subscribe to multiple trainings

**Important Notes:**
- Subscribing is free (no voucher cost)
- You can unsubscribe at any time
- Subscribing doesn't guarantee attendance

#### Managing Subscriptions

**Viewing Your Subscriptions:**
- Your subscribed trainings are highlighted in the Public view
- You can see subscription status in the Attendance view

**Unsubscribing:**
- Click **"Unsubscribe"** to remove yourself from a training
- This won't affect your voucher balance

### ✅ Attendance Management

#### Marking Attendance

1. Go to the **Attendance** view
2. Find the training you want to attend
3. Click **"Mark Attendance"** next to your name
4. One voucher will be deducted from your balance

**Requirements:**
- You must be subscribed to the training
- You must have at least 1 voucher available
- You can only mark attendance once per training

#### Cancelling Attendance

1. Go to the **Attendance** view
2. Find the training where you marked attendance
3. Click **"Cancel Attendance"** next to your name
4. Your voucher will be refunded

**Important Notes:**
- You can only cancel attendance if you previously marked it
- Cancelling immediately refunds the voucher
- There's no time limit for cancellation

### 💰 Voucher Management

#### Understanding Your Balance

**Where to Check:**
- Your voucher balance is displayed in the interface
- Balance updates in real-time when you mark/cancel attendance

**Voucher Rules:**
- You cannot attend trainings without vouchers
- Vouchers are only spent when marking attendance
- Vouchers are refunded when cancelling attendance
- Contact an administrator to add vouchers to your account

#### Requesting Vouchers

If you need more vouchers:
1. Contact your system administrator
2. Provide your email address
3. Explain why you need additional vouchers
4. The admin will add vouchers to your account

### 🎯 Best Practices

#### Training Selection

**Before Subscribing:**
- Read the training description carefully
- Check if you meet any prerequisites
- Consider your schedule and availability
- Review your voucher balance

**Subscription Strategy:**
- Subscribe to trainings you're genuinely interested in
- Don't subscribe to trainings you can't attend
- Keep your subscription list manageable

#### Attendance Planning

**Before Marking Attendance:**
- Ensure you can actually attend the training
- Check your voucher balance
- Verify the training details
- Plan your schedule accordingly

**After Marking Attendance:**
- Add the training to your calendar
- Set reminders for the training date
- Prepare any required materials
- Contact the trainer if you have questions

---

## Troubleshooting

### 🔧 Common Issues

#### "Cannot Mark Attendance"

**Possible Causes:**
- Insufficient vouchers
- Not subscribed to the training
- Already marked attendance

**Solutions:**
1. Check your voucher balance
2. Subscribe to the training first
3. Cancel previous attendance if needed

#### "Training Not Appearing"

**Possible Causes:**
- Training was deleted by admin
- System loading issue
- Network connectivity problem

**Solutions:**
1. Refresh the page
2. Check your internet connection
3. Contact an administrator

#### "Voucher Balance Not Updating"

**Possible Causes:**
- Network delay
- System error
- Browser cache issue

**Solutions:**
1. Wait a few seconds and refresh
2. Clear browser cache
3. Try a different browser
4. Contact an administrator

### 🚨 Error Messages

#### "Failed to load data"
- Check your internet connection
- Refresh the page
- Contact an administrator if the issue persists

#### "Permission denied"
- You may not have the required permissions
- Contact an administrator for access

#### "Network error"
- Check your internet connection
- Try again in a few minutes
- Contact your IT department if the issue persists

### 📞 Getting Help

#### Contact Information

**For Technical Issues:**
- Contact your system administrator
- Provide your email address
- Describe the issue in detail
- Include any error messages

**For Training Questions:**
- Contact the training organizer
- Check the training description
- Review any provided materials

#### Self-Service Options

**Before Contacting Support:**
1. Check this user manual
2. Try refreshing the page
3. Clear your browser cache
4. Try a different browser
5. Check your internet connection

---

## FAQ

### General Questions

**Q: How do I get started with the system?**
A: Simply open the application in your browser. No account creation is required - you can start browsing trainings immediately.

**Q: Do I need to create an account?**
A: No, the system uses anonymous access. Your identity is tracked by your email address.

**Q: Can I use the system on mobile devices?**
A: Yes, the system is responsive and works on smartphones and tablets.

### Voucher Questions

**Q: How do I get more vouchers?**
A: Contact your system administrator to add vouchers to your account.

**Q: Can I transfer vouchers to another user?**
A: No, vouchers are non-transferable and tied to individual accounts.

**Q: Do vouchers expire?**
A: Currently, vouchers do not expire, but this may change based on organizational policies.

### Training Questions

**Q: Can I attend a training without subscribing first?**
A: No, you must subscribe to a training before you can mark attendance.

**Q: What happens if I miss a training I marked attendance for?**
A: You can cancel your attendance to get your voucher refunded.

**Q: Can I attend the same training multiple times?**
A: Currently, you can only mark attendance once per training, but you can subscribe multiple times.

### Technical Questions

**Q: What browsers are supported?**
A: The system works on all modern browsers including Chrome, Firefox, Safari, and Edge.

**Q: Is my data secure?**
A: Yes, all data is stored securely in Supabase with proper encryption and access controls.

**Q: Can I export my training history?**
A: Currently, data export is available through the Supabase dashboard for administrators.

### Administrative Questions

**Q: How do I add multiple users at once?**
A: Currently, users must be added individually. Consider using the Supabase dashboard for bulk operations.

**Q: Can I set up automatic voucher distribution?**
A: This feature is not currently available but can be implemented as a custom solution.

**Q: How do I backup the system data?**
A: Supabase provides automated backups. You can also export data manually through the dashboard.

---

## 📖 Quick Reference

### Keyboard Shortcuts
- `Ctrl + R` or `F5`: Refresh page
- `Ctrl + F`: Search page content
- `Tab`: Navigate between elements

### Common Actions

**For Users:**
- Subscribe to training: Click "Subscribe" button
- Mark attendance: Click "Mark Attendance" button
- Cancel attendance: Click "Cancel Attendance" button
- Check vouchers: Look at voucher balance display

**For Admins:**
- Create user: Fill form and click "Create User"
- Add voucher: Click "+" button
- Remove voucher: Click "-" button
- Create training: Fill form and click "Create Training"
- Edit training: Click edit icon and save changes

### Status Indicators

- ✅ **Subscribed**: You're signed up for this training
- 🎫 **Attended**: You've marked attendance (voucher spent)
- ⚠️ **No Vouchers**: Insufficient vouchers for attendance
- 🔒 **Admin Only**: Administrative function

---

*Last updated: August 2024*
*Version: 1.0*

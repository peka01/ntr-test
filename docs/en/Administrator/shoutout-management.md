# Shoutout Management

The shoutout management system allows administrators to create, edit, and manage news announcements and feature highlights to inform users about system updates and new features.

## Overview

News announcements (shoutouts) are messages that:
- Inform users about new features
- Announce system updates
- Highlight improvements
- Provide important system notifications

## Creating a News Announcement

### Basic Information

1. **Title**: Enter a clear and engaging title
2. **Description**: Write a detailed description of the news
3. **Category**: Choose from:
   - **Feature**: New features or functionality
   - **Improvement**: Enhancements to existing features
   - **Announcement**: Important system notifications or updates

### Priority and Visibility

- **Low**: Displayed normally, no special emphasis
- **Medium**: Displayed with light emphasis
- **High**: Displayed with strong emphasis and higher visibility

### Expiration Date

- **No expiration date**: The message is displayed until manually removed
- **Specific date**: The message automatically disappears after the specified date
- **Automatic cleanup**: The system automatically cleans up expired messages

## Linking to Tours

### Integration with Tour System

You can link news announcements to existing tours to:
- Give users direct access to guidance
- Create a smooth transition from information to practical guidance
- Improve user experience

### How to Link to a Tour

1. **Select Tour**: Choose an existing tour from the list
2. **Automatic Linking**: The system automatically creates a link to the tour
3. **Button Text**: Users see a "Start Guided Tour" button in the message

## Managing Existing Messages

### Edit Message

1. In the message list, click **Edit** next to the message
2. Make your changes
3. Click **Save** to update the message

### Duplicate Message

1. Click **Duplicate** next to an existing message
2. A copy is created with the name "Copy of [original title]"
3. Edit the copy according to your needs

### Delete Message

1. Click **Delete** next to the message
2. Confirm the deletion in the dialog
3. **Warning**: This action cannot be undone

### Mark as Read

Users can mark messages as read. Administrators can see:
- Number of users who have read the message
- Number of users who have not read the message
- Read statistics per message

## Message Statistics

The system tracks the following statistics for each message:
- **Total Messages**: Number of created messages
- **Active Messages**: Messages currently displayed to users
- **Expired Messages**: Messages that have passed their expiration date
- **Categories**: Number of messages per category
- **Priority Distribution**: Number of messages per priority level

## Import and Export

### Export Messages

1. Click **Export** in the news management panel
2. The system generates a JSON file with all messages
3. Save the file for backup or sharing

### Import Messages

1. Click **Import** in the news management panel
2. Paste JSON data into the text field
3. Click **Import Messages** to load the data

## "New" Indicator

### Automatic Marking

- **New Messages**: Displayed with a "New" indicator
- **Automatic Update**: The indicator disappears when the user reads the message
- **Visual Emphasis**: The "New" indicator helps users discover new content

### Managing Indicators

- **User View**: Users see the "New" indicator until they read the message
- **Admin Overview**: Administrators can see which messages are new for users
- **Statistics**: Track how many users have seen each message

## Best Practices

### Writing Effective Messages

- **Clear Title**: Use a title that explains what the news is about
- **Specific Description**: Describe specifically what has changed or been added
- **User-Centered**: Focus on benefits for the user
- **Short and Concise**: Keep the message brief but informative

### Choosing the Right Category

- **Feature**: Use for completely new features or significant additions
- **Improvement**: Use for enhancements to existing features
- **Announcement**: Use for system updates, maintenance, or important notifications

### Managing Priority

- **High Priority**: Use sparingly for critical messages
- **Medium Priority**: Use for important but not critical updates
- **Low Priority**: Use for less important messages

### Planning Expiration Dates

- **Time-Limited Campaigns**: Use expiration dates for temporary messages
- **Permanent Information**: Leave without expiration date for important information
- **Automatic Cleanup**: Let the system automatically clean up expired messages

## Troubleshooting

### Common Issues

**Message not displaying**
- Check that the message is active
- Verify that the expiration date has not passed
- Check that the user has the right role

**"New" indicator not disappearing**
- Check that the user has clicked on the message
- Verify that the read status is updating correctly
- Check the browser's cache

**Tour not linking correctly**
- Check that the tour still exists
- Verify that the user has access to the tour
- Check that the link is correctly configured

### Debug Tips

1. **Test as User**: Log in as a regular user to see messages
2. **Check Dates**: Verify that expiration dates are correctly specified
3. **Check Roles**: Make sure the user has the right permissions

## Integration with Other Systems

### Tour System

- **Automatic Linking**: Create smooth transitions from information to practical guidance
- **Contextual Help**: Give users direct access to relevant tours
- **Improved User Experience**: Combine information with interactive guidance

### Help System

- **Contextual Help**: Link to relevant help documentation
- **AI Assistant**: Use the AI assistant to answer questions about messages
- **Search Function**: Users can search for specific messages in the help system

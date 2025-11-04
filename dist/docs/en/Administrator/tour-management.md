# Tour Management

The tour management system allows administrators to create, edit, and manage guided tours to help users learn the system's features.

## Overview

Guided tours are interactive walkthroughs that help users:
- Learn new features
- Understand the system's structure
- Navigate through complex workflows
- Get contextual help

## Creating a New Tour

### Basic Information

1. **Tour Name**: Enter a descriptive name for the tour
2. **Description**: Write a brief description of what the tour covers
3. **Category**: Choose from:
   - **Onboarding**: For new users
   - **Feature**: For specific features
   - **Admin**: For administrative functions
   - **User**: For user functions

### Role Requirements

- **Any User**: All users can see the tour
- **Admin Only**: Only administrators can see the tour
- **User Only**: Only regular users can see the tour

### Estimated Duration

Specify how long (in minutes) the tour is estimated to take.

## Managing Tour Steps

### Step Types

Each step in a tour can have different action types:

#### Navigate
- Moves the user to a specific page
- Used to show different parts of the system

#### Click
- Highlights an element the user should click
- Used to show interactive elements

#### Scroll
- Shows the user they should scroll on the page
- Used to show content that's not visible

#### Wait
- Pauses the tour for a specified time
- Used to give the user time to read

#### Highlight
- Highlights an element without clicking
- Used to draw attention to important elements

### Step Configuration

For each step, specify:

1. **Step Title**: A short title for the step
2. **Step Content**: Detailed description of what the user should do
3. **Target Selector**: CSS selector for the element to be highlighted
4. **Position**: Where the tooltip should appear (top, bottom, left, right, center)
5. **Action**: What type of action should be performed
6. **Required View**: Which page must be active for the step
7. **Skip if Target Not Found**: Whether the step should be skipped if the element doesn't exist

### Target Selectors (data-tour attributes)

For a tour to work correctly, target selectors must match `data-tour` attributes in the code:

```html
<!-- Example of data-tour attributes -->
<button data-tour="create-training-btn">Create Training</button>
<div data-tour="user-list">User List</div>
```

## Tour Statistics

The system tracks the following statistics for each tour:
- **Total Tours**: Number of created tours
- **Total Steps**: Total number of steps in all tours
- **Average Steps/Tour**: Average number of steps per tour
- **Categories**: Number of tours per category

## Import and Export

### Export Tours

1. Click **Export** in the tour management panel
2. The system generates a JSON file with all tours
3. Save the file for backup or sharing

### Import Tours

1. Click **Import** in the tour management panel
2. Paste JSON data into the text field
3. Click **Import Tours** to load the data

## Editing Existing Tours

### Selecting a Tour to Edit

1. In the tour list, click **Edit** next to the tour you want to modify
2. The tour loads in edit mode
3. Make your changes and click **Save**

### Duplicate Tour

1. Click **Duplicate** next to an existing tour
2. A copy is created with the name "Copy of [original name]"
3. Edit the copy according to your needs

### Delete Tour

1. Click **Delete** next to the tour
2. Confirm the deletion in the dialog
3. **Warning**: This action cannot be undone

## Best Practices

### Planning Your Tour

- **Start with goals**: What should the user learn?
- **Break into steps**: Each step should focus on one thing
- **Test the flow**: Go through the tour as a user would

### Writing Effective Steps

- **Be clear**: Use simple, direct instructions
- **Be specific**: Specify exactly what the user should do
- **Keep it short**: Each step should be easy to understand quickly

### Choosing the Right Target Selectors

- **Use data-tour attributes**: This is the best method
- **Test selectors**: Verify that the element is found correctly
- **Plan for changes**: Choose stable elements that don't change often

## Troubleshooting

### Common Issues

**Tour doesn't start**
- Check that all steps have valid target selectors
- Verify that required views are correctly specified
- Check that the user has the right role

**Steps are skipped unexpectedly**
- Check that the target selector matches an element on the page
- Verify that the element is visible when the step runs
- Check the "Skip if target not found" setting

**Tooltip appears in wrong place**
- Adjust the position (top, bottom, left, right, center)
- Check that there's enough space
- Test on different screen sizes

### Debug Tips

1. **Use developer tools**: Inspect elements to find the right selector
2. **Test step by step**: Run the tour and check each step
3. **Check the console**: Look for error messages in the browser console

## Integration with News System

Tours can be linked to news announcements to:
- Announce new features
- Give users direct access to guidance
- Create a smooth user experience

When creating a news announcement, you can link it to an existing tour to give users both information and practical guidance.

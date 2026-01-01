# Blog Editor Guide - Rich Text Editor with Arabic Support

## Overview
The blog editor now features a powerful rich text editor with live preview and comprehensive Arabic text support. This guide will help you create and edit blog posts effectively.

## Getting Started

### Accessing the Blog Editor
1. Log in to the admin panel at `/admin/login`
2. Navigate to `/admin/blog`
3. Click "Create New Post" or edit an existing post

## Editor Features

### Toolbar Overview
The editor provides a comprehensive toolbar with the following formatting options:

#### Text Formatting
- **Bold** (Ctrl+B / ⌘+B): Make text bold
- **Italic** (Ctrl+I / ⌘+I): Italicize text
- **Underline** (Ctrl+U / ⌘+U): Underline text
- **Strikethrough**: Strike through text
- **Highlight**: Highlight text with a yellow background

#### Headings
- **Heading 1**: Main section headings
- **Heading 2**: Subsection headings
- **Heading 3**: Smaller headings

#### Lists and Blocks
- **Bullet List**: Create unordered lists
- **Numbered List**: Create ordered lists
- **Quote**: Add blockquotes for important citations
- **Code Block**: Insert code snippets with proper formatting

#### Alignment
- **Align Left**: Default left alignment
- **Align Center**: Center text
- **Align Right**: Right alignment (essential for Arabic text)

#### Media and Links
- **Add Link**: Create hyperlinks
  - Click the link icon
  - Enter the URL when prompted
  - Select text first to make it a link
  - Click the link icon again when on a link to remove it
- **Add Image**: Insert images
  - Click the image icon
  - Enter the image URL when prompted
  - Images will automatically resize and have rounded corners

#### Special Elements
- **Emoji Picker**: Click the smile icon to insert common emojis
  - Popular emojis available: 😊 👍 ❤️ 🎉 ✨ 🔥 💡 📌 ✅ ⚡ 🚀 💼 📊 🌟 💪
- **Horizontal Line**: Insert a divider line

#### Undo/Redo
- **Undo** (Ctrl+Z / ⌘+Z): Undo last action
- **Redo** (Ctrl+Y / ⌘+Y): Redo undone action

### Live Preview
The editor features a split-view with:
- **Editor Panel (Left)**: Where you write and format content
- **Preview Panel (Right)**: Real-time preview of how your content will appear

Toggle the preview:
- Click "Hide Preview" to expand the editor to full width
- Click "Show Preview" to see the live preview again

## Working with Arabic Text

### Why Arabic Support?
The editor fully supports Arabic text with automatic text direction detection and proper formatting tools.

### How to Write in Arabic

#### Automatic Detection
1. Simply start typing or paste Arabic text into the editor
2. The text direction will automatically adjust
3. No special settings required

#### Manual Alignment
For better control over Arabic text presentation:
1. Type or paste your Arabic content
2. Select the Arabic text (or place cursor in the paragraph)
3. Click the **Align Right** button in the toolbar
4. The text will align to the right, which is the natural reading direction for Arabic

#### Mixed Content (English and Arabic)
When mixing English and Arabic in the same article:
1. Each paragraph's direction will auto-detect based on the first character
2. You can manually adjust alignment for specific paragraphs:
   - English paragraphs: Use **Align Left**
   - Arabic paragraphs: Use **Align Right**
3. The preview will show exactly how it will appear to readers

#### Best Practices for Arabic Content
- Use **Align Right** for Arabic paragraphs to ensure proper reading flow
- When quoting Arabic text, select the text and use both the Quote and Align Right buttons
- Arabic lists work perfectly with the Bullet List and Numbered List features
- Emojis display correctly with Arabic text

### Example: Creating a Bilingual Post
1. **English Section**:
   - Write in English
   - Use default left alignment
   - Apply formatting as needed

2. **Arabic Section**:
   - Type or paste Arabic text
   - Select the Arabic content
   - Click **Align Right** for proper display
   - Apply other formatting (bold, headings, etc.) as needed

## Form Fields

### Required Fields (marked with *)
- **English Title**: Auto-generates URL slug
- **French Title**: Auto-generates URL slug
- **English Excerpt**: Brief summary (displayed in blog list)
- **French Excerpt**: Brief summary in French
- **English Content**: Full article content (Rich Text Editor)
- **French Content**: Full article content in French (Rich Text Editor)

### Optional Fields
- **Category**: Select from existing categories or create a new one
- **Cover Image URL**: Link to header image
- **Published**: Check to publish immediately, uncheck for draft

## Creating a Blog Post

### Step-by-Step Guide

1. **Enter Basic Information**
   - Fill in English and French titles
   - The URL slug will auto-generate (you can see it below each title)

2. **Add Excerpts**
   - Write brief summaries for both languages
   - Keep them concise (2-3 sentences)

3. **Write Content**
   - Use the rich text editor for English content
   - Format text using the toolbar
   - Add images, links, lists as needed
   - Check the live preview to see how it looks

4. **Write French/Arabic Content**
   - Switch to the French content editor
   - Write in French, Arabic, or both
   - For Arabic sections:
     - Type or paste Arabic text
     - Select and click **Align Right**
     - Use preview to verify proper display

5. **Add Metadata**
   - Select a category (or create a new one)
   - Add cover image URL if available
   - Preview the image to ensure it works

6. **Publish or Save**
   - Check "Publish immediately" to make it live
   - Or leave unchecked to save as draft
   - Click "Create Post" to save

## Editing Existing Posts

1. Navigate to `/admin/blog`
2. Find your post in the list
3. Click the edit icon
4. Make your changes
5. The content will load in the rich text editor
6. Edit using the same tools as creating a new post
7. Click "Update Post" to save changes

## Tips and Best Practices

### Formatting Tips
- **Use headings** to structure your content (H1 for main sections, H2 for subsections)
- **Break up long paragraphs** for better readability
- **Add bullet points** for lists and key points
- **Use bold** to emphasize important terms
- **Add images** to make content more engaging
- **Preview frequently** to see how your content looks

### Image Best Practices
- Use high-quality images (1200px width recommended)
- Ensure images are properly hosted (use a reliable image hosting service)
- Test the URL before adding to ensure it loads correctly
- Use descriptive image URLs

### Arabic Content Tips
- Always use **Align Right** for Arabic paragraphs
- Test the preview to ensure proper display
- When mixing languages, use separate paragraphs for each language
- Emojis and special characters work seamlessly with Arabic

### SEO Best Practices
- Write descriptive titles (50-60 characters)
- Create compelling excerpts (150-160 characters)
- Use headings to structure content
- Include relevant keywords naturally
- Add cover images for better social media sharing

## Troubleshooting

### Content Not Saving
- Check that both English and French content fields have content
- Ensure titles are filled in
- Check your internet connection
- Look for error messages in the browser console

### Images Not Displaying
- Verify the image URL is correct
- Ensure the image is publicly accessible
- Try a different image hosting service
- Check if the URL starts with `https://`

### Arabic Text Not Displaying Correctly
- Make sure you've selected the text and clicked **Align Right**
- Check the preview panel to see actual rendering
- Clear your browser cache if issues persist
- Ensure your browser supports Arabic text (all modern browsers do)

### Preview Not Updating
- The preview updates in real-time as you type
- If it's not updating, try clicking in the editor
- Refresh the page if needed
- Check browser console for errors

## Keyboard Shortcuts

- **Ctrl/⌘ + B**: Bold
- **Ctrl/⌘ + I**: Italic
- **Ctrl/⌘ + U**: Underline
- **Ctrl/⌘ + Z**: Undo
- **Ctrl/⌘ + Y**: Redo
- **Ctrl/⌘ + Shift + 7**: Bullet list
- **Ctrl/⌘ + Shift + 8**: Numbered list

## Support

If you encounter any issues or need help:
1. Check this guide first
2. Review the inline help messages (blue info boxes)
3. Contact the technical team
4. Keep screenshots of any errors for faster troubleshooting

## Updates and New Features

This editor is regularly updated with new features. Check back for:
- Additional formatting options
- More emoji choices
- Enhanced image handling
- Additional language support

---

**Last Updated**: January 2026  
**Version**: 2.0

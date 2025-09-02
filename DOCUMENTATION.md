# Documentation System Setup

This repository now includes a comprehensive documentation system built with **MkDocs** and the **Material for MkDocs** theme. This provides a professional, searchable, and navigable documentation website that can be deployed to GitHub Pages.

## 🚀 Quick Start

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Installation

1. **Install Python dependencies:**
   ```bash
   # Windows
   scripts\docs.bat install
   
   # Unix/Linux/macOS
   ./scripts/docs.sh install
   ```

2. **Start the development server:**
   ```bash
   # Windows
   scripts\docs.bat serve
   
   # Unix/Linux/macOS
   ./scripts/docs.sh serve
   ```

3. **Open your browser** and navigate to `http://127.0.0.1:8000`

## 📁 Project Structure

```
docs/
├── index.md                    # Main documentation homepage
├── user-guide/                 # User documentation
│   ├── overview.md
│   ├── getting-started.md
│   └── features.md
├── admin-guide/                # Administrator documentation
│   ├── user-management.md
│   ├── training-management.md
│   ├── voucher-system.md
│   ├── subscriptions.md
│   └── attendance.md
├── help/                       # Help system guidelines
│   ├── content-guidelines.md
│   ├── writing-checklist.md
│   └── tone-and-voice.md
├── api/                        # API documentation
│   ├── data-service.md
│   ├── help-service.md
│   └── gemini-service.md
└── deployment/                 # Deployment guides
    ├── setup.md
    ├── docker.md
    └── supabase.md
```

## 🛠 Configuration

### MkDocs Configuration (`mkdocs.yml`)

The main configuration file includes:

- **Material Theme**: Modern, responsive design with dark/light mode
- **Search**: Full-text search across all documentation
- **Navigation**: Hierarchical navigation with tabs and sections
- **Plugins**: Git revision dates, minification, and more
- **Extensions**: Rich Markdown extensions for enhanced content

### Key Features

#### 🎨 Material Design Theme
- Responsive design for all devices
- Dark/light mode toggle
- Professional appearance
- Accessibility features

#### 🔍 Advanced Search
- Full-text search across all content
- Search suggestions
- Search result highlighting
- Search sharing capabilities

#### 📱 Responsive Navigation
- Collapsible sidebar navigation
- Tab-based organization
- Breadcrumb navigation
- Mobile-friendly design

#### 📝 Rich Content Support
- Code syntax highlighting
- Admonitions (info, warning, note boxes)
- Tabbed content
- Task lists
- Emoji support
- Mathematical expressions

## 📖 Content Management

### Adding New Documentation

1. **Create a new Markdown file** in the appropriate directory
2. **Add navigation entry** in `mkdocs.yml`
3. **Follow content guidelines** from `docs/help/content-guidelines.md`
4. **Test locally** with `mkdocs serve`

### Content Guidelines

Follow the established content guidelines:

- **Language Priority**: Swedish first, then English
- **Structure**: Use appropriate headers and sections
- **Tone**: Follow the ENKLA, ENGAGERADE, MÄNSKLIGA principles
- **Formatting**: Use proper Markdown syntax

### Markdown Extensions

The system supports enhanced Markdown features:

```markdown
!!! note "Important Note"
    This is an important note with a custom title.

!!! warning "Warning"
    This is a warning message.

!!! tip "Pro Tip"
    This is a helpful tip.

=== "Tab 1"
    Content for tab 1

=== "Tab 2"
    Content for tab 2

- [ ] Task 1
- [x] Task 2 (completed)
```

## 🚀 Deployment

### Local Development

```bash
# Start development server
scripts/docs.bat serve    # Windows
./scripts/docs.sh serve   # Unix/Linux/macOS
```

### Building for Production

```bash
# Build static site
scripts/docs.bat build    # Windows
./scripts/docs.sh build   # Unix/Linux/macOS
```

The built site will be in the `site/` directory.

### GitHub Pages Deployment

```bash
# Deploy to GitHub Pages
scripts/docs.bat deploy   # Windows
./scripts/docs.sh deploy  # Unix/Linux/macOS
```

This will:
1. Build the documentation
2. Deploy to the `gh-pages` branch
3. Make it available at `https://your-username.github.io/ntr-test/`

## 🔧 Customization

### Theme Customization

Edit `mkdocs.yml` to customize:

- **Colors**: Change primary and accent colors
- **Logo**: Add your organization logo
- **Favicon**: Custom favicon
- **Social Links**: Add social media links
- **Analytics**: Google Analytics integration

### Adding Plugins

Install additional plugins:

```bash
pip install mkdocs-plugin-name
```

Then add to `mkdocs.yml`:

```yaml
plugins:
  - plugin-name
```

## 📚 Available Commands

### Windows (`scripts/docs.bat`)
```bash
docs.bat install   # Install dependencies
docs.bat serve     # Start development server
docs.bat build     # Build static site
docs.bat deploy    # Deploy to GitHub Pages
```

### Unix/Linux/macOS (`scripts/docs.sh`)
```bash
./docs.sh install   # Install dependencies
./docs.sh serve     # Start development server
./docs.sh build     # Build static site
./docs.sh deploy    # Deploy to GitHub Pages
```

## 🔍 Search and Navigation

### Search Features
- **Full-text search** across all content
- **Search suggestions** as you type
- **Search result highlighting**
- **Search sharing** with direct links

### Navigation Features
- **Hierarchical navigation** with collapsible sections
- **Tab-based organization** for different user types
- **Breadcrumb navigation** for easy orientation
- **Previous/Next navigation** within sections

## 🌐 Multi-language Support

The documentation system supports multiple languages:

- **Primary Language**: Swedish
- **Secondary Language**: English
- **Language Switching**: Built-in language selector
- **Content Synchronization**: Keep both versions in sync

## 📱 Mobile Support

The documentation is fully responsive:

- **Mobile-first design**
- **Touch-friendly navigation**
- **Optimized for all screen sizes**
- **Fast loading on mobile networks**

## 🔒 Security and Performance

### Security Features
- **HTTPS enforcement** on GitHub Pages
- **Content Security Policy** headers
- **XSS protection**
- **Secure external links**

### Performance Optimizations
- **Minified HTML/CSS/JS**
- **Optimized images**
- **Lazy loading** for better performance
- **CDN integration** for faster loading

## 🆘 Troubleshooting

### Common Issues

#### MkDocs not found
```bash
pip install mkdocs
```

#### Theme not loading
```bash
pip install mkdocs-material
```

#### Build errors
Check for:
- Invalid Markdown syntax
- Missing navigation entries
- Broken links

#### Deployment issues
- Ensure GitHub Pages is enabled
- Check repository permissions
- Verify branch name (`gh-pages`)

### Getting Help

- **MkDocs Documentation**: https://www.mkdocs.org/
- **Material for MkDocs**: https://squidfunk.github.io/mkdocs-material/
- **GitHub Issues**: Report issues in the repository

## 📈 Analytics and Monitoring

### Google Analytics
Add your Google Analytics ID to `mkdocs.yml`:

```yaml
extra:
  analytics:
    provider: google
    property: G-XXXXXXXXXX
```

### Search Analytics
Track popular search terms and content usage through the built-in search analytics.

## 🔄 Continuous Integration

### GitHub Actions
Set up automatic deployment with GitHub Actions:

```yaml
name: Deploy Documentation
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-python@v2
      with:
        python-version: 3.9
    - run: pip install -r requirements.txt
    - run: mkdocs gh-deploy --force
```

## 📞 Support

For documentation-related questions:

1. **Check the help system** in the documentation
2. **Review content guidelines** in `docs/help/`
3. **Contact the development team**
4. **Create an issue** in the repository

---

*This documentation system is designed to grow with your project. Add new content, customize the theme, and deploy updates as needed.*



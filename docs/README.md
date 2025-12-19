# OMED Documentation Site

This branch contains the GitHub Pages documentation website for the OMED School Ideas Platform.

## 📚 Documentation Structure

- **index.html** - Main documentation homepage with overview and navigation
- **architecture.html** - Detailed system architecture and design decisions
- **supabase-setup.html** - Complete Supabase backend setup guide
- **migration-guide.html** - Migration guide from mock data to Supabase
- **capacitor-setup.html** - iOS and Android mobile app setup
- **user-guide.html** - End-user guide for students, teachers, and principals
- **api-reference.html** - API documentation for hooks and functions
- **deployment.html** - Deployment guide for web and mobile platforms
- **contributing.html** - Contributing guidelines for developers

## 🎨 Assets

All styling, scripts, and assets are in the `assets/` directory:
- `style.css` - Main stylesheet with modern, responsive design
- `doc-page.css` - Documentation page-specific styles
- `script.js` - Interactive features and navigation
- `favicon.svg` - Site icon

## 🌐 Viewing the Documentation

The documentation is automatically published to GitHub Pages at:
https://omed-school.github.io/Omedfrontendfigma/

## 🛠️ Local Development

To view the documentation locally:

```bash
# Option 1: Using Python
cd docs
python3 -m http.server 8000

# Option 2: Using Node.js http-server
npm install -g http-server
cd docs
http-server

# Option 3: Using PHP
cd docs
php -S localhost:8000
```

Then open http://localhost:8000 in your browser.

## 📝 Updating Documentation

1. Switch to the `gh-pages` branch
2. Edit HTML files in the `docs/` directory
3. Test locally using one of the methods above
4. Commit and push changes
5. GitHub Pages will automatically update

## 🎯 Key Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Clean, professional design with smooth animations
- **Easy Navigation** - Clear structure with breadcrumbs and navigation
- **Comprehensive** - Covers all aspects of the OMED platform
- **Searchable** - Browser search works across all pages
- **Fast Loading** - Optimized static HTML/CSS/JS

## 📖 Content Sources

Documentation is compiled from various markdown files in the main repository:
- SUPABASE_SETUP.md
- MIGRATION_GUIDE.md
- CAPACITOR_SETUP.md
- GEMINI.md
- And other documentation files

## 🤝 Contributing to Documentation

To improve the documentation:

1. Create a new branch from `gh-pages`
2. Make your changes to HTML files
3. Test locally
4. Submit a pull request
5. Maintainers will review and merge

## 📋 Maintenance

- Keep documentation in sync with code changes
- Update API reference when hooks change
- Add examples for new features
- Fix broken links and outdated information
- Improve clarity based on user feedback

## 🔗 Related Links

- [Main Repository](https://github.com/OMED-school/Omedfrontendfigma)
- [Issues](https://github.com/OMED-school/Omedfrontendfigma/issues)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)

---

© 2024 OMED School Platform. Created with ❤️ for students, teachers, and schools.

# Contributing to Peachmini

First off, thank you for considering contributing to Peachmini! 🍑

## 🎯 Ways to Contribute

- 🐛 **Bug Reports** - Found a bug? Open an issue
- ✨ **Feature Requests** - Have an idea? We'd love to hear it
- 📝 **Documentation** - Improve docs or add examples
- 💻 **Code Contributions** - Submit PRs for features or fixes
- 🌍 **Translations** - Help localize the app

## 🚀 Getting Started

### 1. Fork & Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/peach-mini.git
cd peach-mini
```

### 2. Install Dependencies

```bash
# API
cd api && npm install

# Frontend
cd ../peach-web && npm install

# Bot
cd ../bot && npm install
```

### 3. Create Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 4. Make Changes

- Follow existing code style
- Add tests if applicable
- Update documentation

### 5. Test

```bash
# Run smoke tests
npm run doctor:smoke

# Test locally
npm run dev
```

### 6. Commit

```bash
# Use conventional commits
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update README"
```

**Commit Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting)
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

### 7. Push & PR

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub.

## 📋 Pull Request Guidelines

### PR Checklist

- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console errors
- [ ] Smoke tests pass
- [ ] Descriptive PR title

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing
How was this tested?

## Screenshots (if applicable)
```

## 🐛 Bug Reports

### Template

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g. macOS]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]
```

## ✨ Feature Requests

### Template

```markdown
**Is your feature request related to a problem?**
Description of problem

**Describe the solution**
How you'd like it to work

**Alternatives considered**
Other approaches you've thought about

**Additional context**
Any other info
```

## 💻 Development Guidelines

### Code Style

**JavaScript/JSX:**
- Use ES6+ features
- Prefer `const` over `let`
- Use arrow functions
- Descriptive variable names
- Comments for complex logic

**Example:**
```javascript
// Good ✅
const formatUserMessage = (message) => {
  return message.trim().toLowerCase();
};

// Avoid ❌
function f(m) {
  return m.trim().toLowerCase();
}
```

### File Organization

```
src/
├── pages/          # Route components
├── components/     # Reusable components
│   ├── chat/      # Chat-specific
│   ├── create/    # Create-specific
│   └── shared/    # Shared components
├── services/       # API clients
├── utils/          # Utilities
└── styles/         # Global styles
```

### API Endpoints

Follow standard response format:

```javascript
// Success
{
  ok: true,
  data: { ... }
}

// Error
{
  ok: false,
  error: "Error message",
  code: "ERROR_CODE"
}
```

### Testing

Add tests in `scripts/smoke.sh`:

```bash
test_start "GET /api/new-endpoint"
RESPONSE=$(curl -s "$API_URL/api/new-endpoint")
# ... assertions
pass "Test passed"
```

## 🏗️ Project Architecture

### Frontend (React)
- **Pages** - Route-level components
- **Components** - Reusable UI components
- **Services** - API communication
- **Utils** - Helper functions

### Backend (Express)
- **Routes** - API endpoints
- **Middleware** - CORS, validation
- **Services** - Business logic
- **Utils** - Helper functions

### Database (PocketBase)
- **Collections** - Data models
- **Migrations** - Schema changes

## 📦 Adding Dependencies

```bash
# Check if really needed
# Prefer built-in or existing deps

# Install
npm install package-name

# Update package.json
# Document why it's needed
```

## 🔐 Security

- **Never commit** API keys, tokens, secrets
- Use `.env` for sensitive data
- Validate all user inputs
- Sanitize data before storage
- Rate limit API endpoints

## 📝 Documentation

### When to Update Docs

- New feature → Update README
- API change → Update API section
- Env var added → Update ENV_GUIDE
- Deployment change → Update deploy docs

### Doc Standards

- Clear and concise
- Code examples when helpful
- Screenshots for UI changes
- Keep up-to-date

## 🧪 Testing Checklist

Before submitting PR:

- [ ] Smoke tests pass (`npm run doctor:smoke`)
- [ ] Manual testing done
- [ ] No console errors
- [ ] Works in dev and production
- [ ] Edge cases handled
- [ ] Error messages are user-friendly

## 🎨 UI/UX Guidelines

- Mobile-first design
- Accessible (WCAG 2.1 AA)
- Consistent with existing UI
- Loading states for async operations
- Error states with helpful messages
- Success feedback for user actions

## 🌍 Internationalization

If adding text:

```javascript
// Prepare for i18n
const messages = {
  en: { greeting: "Hello" },
  ru: { greeting: "Привет" }
};

// Use consistently
<h1>{t('greeting')}</h1>
```

## 📞 Questions?

- **Discussions:** [GitHub Discussions](https://github.com/yourusername/peach-mini/discussions)
- **Issues:** [GitHub Issues](https://github.com/yourusername/peach-mini/issues)
- **Telegram:** [@yourusername](https://t.me/yourusername)

## 🙏 Thank You!

Every contribution, no matter how small, helps make Peachmini better.

We appreciate your time and effort! 💜

---

**Happy Coding! 🍑**


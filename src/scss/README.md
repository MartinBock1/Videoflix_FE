# SCSS Architecture

This directory contains all SCSS modules organized by purpose.

## 📁 Directory Structure

```
scss/
├── main.scss                    # Main entry point - imports all modules
│
├── base/                        # Fundamental styles
│   ├── fonts.scss              # Font-face declarations
│   └── typography.scss         # Typography rules and responsive text
│
├── utils/                       # Utilities and helpers
│   └── mixins.scss             # Reusable mixins and functions
│
└── components/                  # Component-specific styles
    └── header_footer.scss      # Header and footer component styles
```

## 🔄 Import Order

The `main.scss` file imports modules in this specific order:

1. **Base** - Fonts and typography (foundation)
2. **Utils** - Mixins and utilities (tools)
3. **Components** - Component-specific styles (implementation)

## 📝 Adding New Modules

### Adding a new base style:
1. Create file in `base/` directory
2. Add `@import 'base/filename';` to `main.scss`

### Adding a new component:
1. Create file in `components/` directory  
2. Add `@import 'components/filename';` to `main.scss`

### Adding utilities:
1. Create file in `utils/` directory
2. Add `@import 'utils/filename';` to `main.scss`

## 🎯 Best Practices

- Keep imports in the correct order in `main.scss`
- Use descriptive file names
- Document complex mixins and functions
- Follow the existing naming conventions

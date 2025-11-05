# Constants File Quick Reference

This document provides a quick reference for the centralized configuration file (`client/src/config/constants.js`).

## File Location

```
client/src/config/constants.js
```

## Import Examples

```javascript
// Import everything
import config from "../config/constants.js";

// Import specific sections
import { theme, navigation, footer, urls } from "../config/constants.js";

// Import component styles
import { componentStyles } from "../config/constants.js";
```

## Available Exports

### `theme`

Color schemes, backgrounds, text colors, borders, status colors

### `typography`

Font families, sizes, weights, line heights

### `layout`

Container settings, spacing scale, breakpoints, border radius

### `siteInfo`

Site name, tagline, description, contact information

### `navigation`

Logo, menu items, auth buttons, cart icon

### `footer`

Footer sections, social media links, contact info, copyright

### `urls`

Frontend routes and backend API endpoints

### `icons`

Icon name mappings for React Icons

### `componentStyles`

Predefined Tailwind class combinations

## Common Use Cases

### Change Primary Color

```javascript
// In constants.js
theme: {
  colors: {
    primary: {
      main: '#your-color',
    }
  }
}
```

### Add Navigation Item

```javascript
// In constants.js
navigation: {
  menuItems: [
    {
      label: "New Page",
      path: "/new-page",
      icon: "FaIconName",
    },
  ];
}
```

### Update Footer Link

```javascript
// In constants.js
footer: {
  sections: [
    {
      title: "Section Name",
      links: [{ label: "Link Text", path: "/link-path" }],
    },
  ];
}
```

### Use Component Styles

```javascript
// In component
import { componentStyles } from "../config/constants.js";

<button className={componentStyles.button.primary}>Click Me</button>;
```

### Use Theme Colors

```javascript
// In component
import { theme } from "../config/constants.js";

<div style={{ backgroundColor: theme.colors.primary.main }}>Content</div>;
```

## Icon Usage

Icons are referenced by name in constants, then mapped to React Icons:

```javascript
// In constants.js
icons: {
  home: 'FaHome',
}

// In component
import { icons } from '../config/constants.js';
import { getIcon } from '../utils/iconMapper.js';

const HomeIcon = getIcon(icons.home);
```

## Best Practices

1. **Never hardcode values** - Always use constants
2. **Update in one place** - All changes go through constants.js
3. **Use componentStyles** - For consistent styling
4. **Follow naming** - Use consistent naming conventions
5. **Document changes** - Comment complex configurations

## Quick Update Checklist

When changing branding:

- [ ] Update `theme.colors`
- [ ] Update `siteInfo`
- [ ] Update `navigation.logo`
- [ ] Update `footer` content
- [ ] Update `tailwind.config.js` colors

When adding a page:

- [ ] Add route to `urls.routes`
- [ ] Add navigation item to `navigation.menuItems`
- [ ] Create page component
- [ ] Add route in `App.jsx`

---

See `PROJECT_STRUCTURE.md` for complete documentation.

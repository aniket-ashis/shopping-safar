# Shopping Safari - Project Structure & Documentation

## Overview

Shopping Safari is a full-stack e-commerce platform built with React, Tailwind CSS, Express.js, and Supabase. The project features a **centralized configuration system** where all styling, content, URLs, icons, and branding are managed through a single JavaScript constants file (`client/src/config/constants.js`).

## Key Feature: Centralized Configuration

The entire application's styling, content, and configuration is controlled through a single file: `client/src/config/constants.js`. This allows for:

- **Easy theme changes**: Update colors, fonts, and styles in one place
- **Quick content updates**: Modify navigation, footer, and site information instantly
- **Consistent branding**: All components reference the same configuration
- **Maintainability**: Single source of truth for all design decisions

## Project Structure

```
shopping-safar/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   │   ├── layout/      # Navbar, Footer, Layout components
│   │   │   ├── common/      # Common UI components (Buttons, Cards, Inputs)
│   │   │   └── features/    # Feature-specific components (ProductCard, CartItem)
│   │   ├── pages/           # Page components (routes)
│   │   │   ├── Home.jsx
│   │   │   ├── Shop.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Guest.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── FAQ.jsx
│   │   │   ├── Policies.jsx
│   │   │   └── Catalog.jsx
│   │   ├── config/          # Configuration files
│   │   │   └── constants.js # ⭐ MASTER CONFIGURATION FILE
│   │   ├── context/         # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   │   ├── api.js       # Axios API client
│   │   │   └── iconMapper.js # Icon mapping utility
│   │   ├── App.jsx          # Main app component with routing
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── postcss.config.js    # PostCSS configuration
│
├── server/                   # Express.js backend
│   ├── routes/              # API route definitions
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   └── users.js
│   ├── controllers/         # Route controllers (business logic)
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   └── orderController.js
│   ├── middleware/          # Express middleware
│   │   └── auth.js          # JWT authentication middleware
│   ├── utils/               # Utility functions
│   │   ├── supabase.js      # Supabase client
│   │   └── jwt.js           # JWT token utilities
│   ├── server.js            # Express server entry point
│   └── package.json
│
├── docs/                    # Documentation
│   └── PROJECT_STRUCTURE.md # This file
│
└── readme.md                # Project README
```

## Centralized Configuration File

### Location

`client/src/config/constants.js`

### Structure

The constants file is organized into the following sections:

#### 1. Theme Configuration (`theme`)

- **Colors**: Primary, secondary, accent colors with light/dark variants
- **Background**: Background color options
- **Text**: Text color variants
- **Border**: Border color options
- **Status**: Success, error, warning, info colors

#### 2. Typography (`typography`)

- **Font Families**: Primary, secondary, heading fonts
- **Font Sizes**: Predefined size scale
- **Font Weights**: Weight options
- **Line Heights**: Line height options

#### 3. Layout (`layout`)

- **Container**: Max width and padding settings
- **Spacing**: Spacing scale (xs, sm, md, lg, xl, etc.)
- **Breakpoints**: Responsive breakpoints
- **Border Radius**: Border radius options

#### 4. Site Information (`siteInfo`)

- Site name, tagline, description
- Contact information (email, phone, address)

#### 5. Navigation (`navigation`)

- Logo configuration
- Menu items with paths and icons
- Authentication button labels and paths
- Cart icon configuration

#### 6. Footer (`footer`)

- Footer sections with links
- Social media links and icons
- Contact information
- Copyright text

#### 7. URLs (`urls`)

- Frontend routes
- Backend API endpoints

#### 8. Icons (`icons`)

- Icon name mappings for React Icons library

#### 9. Component Styles (`componentStyles`)

- Predefined Tailwind class combinations for:
  - Buttons (primary, secondary, accent, outline, danger)
  - Cards (default, hover)
  - Inputs (default, error)
  - Badges (primary, success, warning, danger)

### Usage Example

```javascript
// In any component
import { theme, navigation, componentStyles } from '../config/constants.js';

// Use theme colors
<div className={`bg-[${theme.colors.primary.main}]`}>

// Use navigation items
{navigation.menuItems.map(item => (
  <Link to={item.path}>{item.label}</Link>
))}

// Use component styles
<button className={componentStyles.button.primary}>
  Click Me
</button>
```

## Database Schema (Supabase)

The application uses the following tables:

### `users`

- `id` (uuid, primary key)
- `name` (text)
- `email` (text, unique)
- `password` (text, hashed)
- `role` (text, default: 'customer')
- `created_at` (timestamp)

### `products`

- `id` (uuid, primary key)
- `name` (text)
- `description` (text)
- `price` (decimal)
- `image` (text, URL)
- `category` (text)
- `stock` (integer)
- `created_at` (timestamp)

### `categories`

- `id` (uuid, primary key)
- `name` (text, unique)
- `description` (text)

### `cart_items`

- `id` (uuid, primary key)
- `user_id` (uuid, foreign key -> users.id)
- `product_id` (uuid, foreign key -> products.id)
- `quantity` (integer)
- `created_at` (timestamp)

### `orders`

- `id` (uuid, primary key)
- `user_id` (uuid, foreign key -> users.id)
- `total` (decimal)
- `status` (text: 'pending', 'processing', 'shipped', 'delivered', 'cancelled')
- `shipping_address` (text)
- `shipping_city` (text)
- `shipping_state` (text)
- `shipping_zip` (text)
- `shipping_name` (text)
- `shipping_email` (text)
- `shipping_phone` (text)
- `created_at` (timestamp)

### `order_items`

- `id` (uuid, primary key)
- `order_id` (uuid, foreign key -> orders.id)
- `product_id` (uuid, foreign key -> products.id)
- `quantity` (integer)
- `price` (decimal)

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/guest` - Guest login
- `POST /api/auth/logout` - Logout (requires auth)
- `GET /api/auth/verify` - Verify token (requires auth)

### Products (`/api/products`)

- `GET /api/products` - Get all products (query: category, search)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/categories` - Get all categories

### Cart (`/api/cart`) - Requires Authentication

- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove/:itemId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders (`/api/orders`) - Requires Authentication

- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID

### Users (`/api/users`) - Requires Authentication

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Authentication

The application uses **custom JWT-based authentication** (not Supabase Auth).

### How it works:

1. User registers/logs in → Password is hashed with bcrypt
2. User data stored in Supabase `users` table
3. JWT token generated and returned to client
4. Client stores token in localStorage
5. Token sent in `Authorization: Bearer <token>` header for protected routes
6. Server middleware verifies token and extracts user info

### Guest Users:

- Can browse products
- Can add items to cart (stored temporarily)
- Cannot checkout without registration

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### Frontend Setup

1. Navigate to client directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```bash
cp .env.example .env
```

4. Update `.env` with your API URL:

```
VITE_API_URL=http://localhost:5000/api
```

5. Start development server:

```bash
npm run dev
```

### Backend Setup

1. Navigate to server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:

```
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

5. Set up Supabase database:

   - Create the tables as defined in the Database Schema section
   - Enable Row Level Security (RLS) policies as needed

6. Start server:

```bash
npm start
# or for development with auto-reload:
npm run dev
```

## How to Customize the Theme

### Changing Colors

1. Open `client/src/config/constants.js`
2. Navigate to the `theme.colors` section
3. Update color values:

```javascript
colors: {
  primary: {
    main: '#your-color-here',
    // ...
  }
}
```

4. Update `client/tailwind.config.js` to match:

```javascript
colors: {
  primary: {
    main: '#your-color-here',
    // ...
  }
}
```

### Changing Navigation Items

1. Open `client/src/config/constants.js`
2. Navigate to the `navigation.menuItems` array
3. Add, remove, or modify menu items:

```javascript
menuItems: [
  {
    label: "Your Label",
    path: "/your-path",
    icon: "FaYourIcon",
  },
];
```

### Changing Footer Content

1. Open `client/src/config/constants.js`
2. Navigate to the `footer` object
3. Update sections, links, or social media:

```javascript
footer: {
  sections: [
    {
      title: "Your Section",
      links: [{ label: "Link Text", path: "/link-path" }],
    },
  ];
}
```

### Changing Site Information

1. Open `client/src/config/constants.js`
2. Navigate to the `siteInfo` object
3. Update name, tagline, description, contact info

## Component Architecture

### Layout Components

- **Layout.jsx**: Main layout wrapper with Navbar and Footer
- **Navbar.jsx**: Navigation bar consuming constants for all content
- **Footer.jsx**: Footer component consuming constants for all content

### Page Components

All pages follow a similar structure:

1. Import Layout and constants
2. Use constants for styling and content
3. Implement page-specific functionality

### Context Providers

- **AuthContext**: Manages authentication state
- **CartContext**: Manages shopping cart state

## Best Practices

1. **Always use constants**: Never hardcode colors, text, or URLs in components
2. **Follow the structure**: Keep components organized in their respective folders
3. **Use TypeScript-like patterns**: Even though using JavaScript, maintain type-like consistency
4. **Error handling**: Always handle API errors gracefully
5. **Security**: Never expose sensitive data in client-side code
6. **Performance**: Use React.memo and useMemo where appropriate

## Future Enhancements

- Add product search functionality
- Implement product reviews and ratings
- Add wishlist feature
- Implement payment gateway integration
- Add email notifications
- Implement admin dashboard
- Add product filtering and sorting
- Implement product recommendations

## Troubleshooting

### Common Issues

1. **Icons not showing**: Ensure React Icons is installed and icon names match exactly
2. **API calls failing**: Check CORS settings and API URL in .env
3. **Authentication not working**: Verify JWT_SECRET matches between sessions
4. **Styling not applying**: Clear browser cache and rebuild Tailwind CSS

## Support

For issues or questions:

1. Check this documentation
2. Review the constants.js file structure
3. Check browser console and server logs
4. Verify environment variables are set correctly

---

**Last Updated**: November 2024

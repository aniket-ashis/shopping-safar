# Shopping Safari - E-Commerce Platform

A modern, full-stack e-commerce website built with React, Tailwind CSS, Express.js, and Supabase. Features a **centralized configuration system** for easy customization and maintenance.

## 🎯 Key Features

- **Centralized Configuration**: All styles, content, URLs, and branding managed through a single constants file
- **Complete E-Commerce**: Shop, Cart, Checkout, User Authentication
- **Modern Tech Stack**: React, Tailwind CSS, Express.js, Supabase
- **Custom Authentication**: JWT-based auth (not Supabase Auth)
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modular Architecture**: Clean, scalable folder structure

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd shopping-safar
```

2. **Setup Frontend**

```bash
cd client
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

3. **Setup Backend**

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm start
```

4. **Setup Database**
   - Create Supabase project
   - Create tables as documented in `docs/PROJECT_STRUCTURE.md`
   - Add your Supabase URL and keys to server `.env`

## 📁 Project Structure

```
shopping-safar/
├── client/          # React frontend
├── server/          # Express backend
└── docs/            # Documentation
```

## 🎨 Centralized Configuration

All styling, content, and configuration is managed in:

```
client/src/config/constants.js
```

Update this file to:

- Change color schemes
- Modify navigation items
- Update footer content
- Change site information
- Adjust component styles

**See `docs/PROJECT_STRUCTURE.md` for detailed documentation.**

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS, React Router, React Icons
- **Backend**: Express.js, Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom JWT-based authentication
- **Build Tool**: Vite

## 📚 Documentation

Comprehensive documentation is available in `docs/PROJECT_STRUCTURE.md`:

- Project structure
- Database schema
- API endpoints
- Configuration guide
- Setup instructions
- Customization guide

## 🎯 Pages & Features

- **Home**: Hero section, featured products
- **Shop**: Product listing with filters
- **Product Detail**: Individual product view
- **Cart**: Shopping cart management
- **Checkout**: Order placement
- **Authentication**: Login, Register, Guest login
- **Static Pages**: About, Contact, FAQ, Policies, Catalog

## 🔒 Security

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Environment variable management

## 📝 License

MIT License

## 🤝 Contributing

1. Follow the existing code structure
2. Use the centralized constants file for all styling/content
3. Maintain clean, modular code
4. Document any new features

---

**Built with ❤️ using modern web technologies**

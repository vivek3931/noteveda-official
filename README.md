<div align="center">

# <img src="./frontend/public/noteveda_dark.png" alt="Noteveda Logo" width="100"/>

### *Your Premium Academic Resource Hub*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<br/>

**A modern, community-driven platform for sharing and discovering academic resources**

[Live Demo](https://noteveda.com) • [API Docs](#api-documentation) • [Getting Started](#-getting-started)

<br/>

<img src="https://via.placeholder.com/800x400/000000/FFFFFF?text=Noteveda+Preview" alt="Noteveda Preview" width="100%"/>

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📖 **For Students**
- 🔍 **Smart Discovery** - Find notes, guides, PYQs by domain, subject
- 📄 **PDF Preview** - View documents before downloading
- 💳 **Credit System** - 5 free daily credits, earn more by uploading
- 🤖 **AI Assistant** - Get help understanding content
- ⭐ **Pro Membership** - Unlimited downloads

</td>
<td width="50%">

### 🎓 **For Contributors**
- ⬆️ **Easy Upload** - Drag & drop with duplicate detection
- 🎁 **Earn Credits** - Get rewarded for approved uploads
- 📊 **Track Stats** - Views, downloads, performance
- 🏷️ **Smart Tagging** - Auto-categorization

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
noteveda2/
├── 📁 frontend/          # Next.js 16 + Tailwind + Framer Motion
│   ├── src/
│   │   ├── app/          # App Router pages
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   └── types/        # TypeScript definitions
│   └── public/           # Static assets
│
├── 📁 backend/           # NestJS + Prisma + PostgreSQL
│   ├── src/
│   │   ├── auth/         # JWT authentication
│   │   ├── resources/    # Resource CRUD & search
│   │   ├── credits/      # Credit system logic
│   │   ├── categories/   # Domain hierarchy
│   │   └── admin/        # Admin moderation
│   └── prisma/           # Database schema
│
└── 📄 README.md
```

---

## 🎨 Design Philosophy

> **"Monochromatic Luxury"** - A strictly black & white aesthetic with subtle grays, creating a premium, distraction-free learning environment.

| Aspect | Approach |
|--------|----------|
| **Colors** | Pure black `#000`, white `#FFF`, gray scale |
| **Typography** | Inter (body) + Outfit (display) |
| **Animations** | Subtle, smooth transitions via Framer Motion |
| **Responsive** | Mobile-first, tablet & desktop optimized |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 15+
- **npm** or **pnpm**

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/noteveda.git
cd noteveda

# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

### 2. Configure Environment

Create `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/noteveda"

# JWT Secrets
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_REFRESH_SECRET="another-secret-key-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"

# Server
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### 3. Setup Database

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed  # Optional: seed sample data
```

### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api |
| Swagger Docs | http://localhost:3001/api/docs |

---

## 📡 API Documentation

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create account |
| `/api/auth/login` | POST | Get JWT tokens |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/auth/me` | GET | Get current user |

### Resources
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/resources` | GET | List resources (paginated) |
| `/api/resources/:id` | GET | Get single resource |
| `/api/resources` | POST | Upload new resource |
| `/api/resources/featured` | GET | Featured resources |

### Credits
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/credits` | GET | Get credit balance |
| `/api/credits/download/:id` | POST | Download resource |

> 📖 Full API docs available at `/api/docs` when backend is running

---

## 🔐 Security

- ✅ JWT authentication with refresh token rotation
- ✅ bcrypt password hashing (cost factor 12)
- ✅ CORS whitelist configuration
- ✅ Input validation via class-validator
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Rate limiting ready
- ✅ Security headers configured

---

## 📊 Credit System

| Action | Credits |
|--------|---------|
| Free daily allowance | +5 credits (resets midnight) |
| Upload approved | +1 credit |
| Download resource | -1 credit |
| Re-download (already owned) | Free |
| Pro subscription | Unlimited |

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="100">
<img src="https://cdn.simpleicons.org/nextdotjs/000" width="40"/><br/>
<sub>Next.js 16</sub>
</td>
<td align="center" width="100">
<img src="https://cdn.simpleicons.org/nestjs/E0234E" width="40"/><br/>
<sub>NestJS</sub>
</td>
<td align="center" width="100">
<img src="https://cdn.simpleicons.org/postgresql/336791" width="40"/><br/>
<sub>PostgreSQL</sub>
</td>
<td align="center" width="100">
<img src="https://cdn.simpleicons.org/prisma/2D3748" width="40"/><br/>
<sub>Prisma</sub>
</td>
<td align="center" width="100">
<img src="https://cdn.simpleicons.org/tailwindcss/06B6D4" width="40"/><br/>
<sub>Tailwind</sub>
</td>
<td align="center" width="100">
<img src="https://cdn.simpleicons.org/framer/0055FF" width="40"/><br/>
<sub>Framer Motion</sub>
</td>
</tr>
</table>

---

## 📁 Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing with hero, stats, featured |
| Browse | `/browse` | Discover resources with filters |
| Resource | `/resource/:id` | PDF viewer + details |
| Upload | `/upload` | Submit new resource |
| Profile | `/profile` | User dashboard |
| Pricing | `/pricing` | Subscription plans |
| Login | `/login` | Authentication |
| Admin | `/admin` | Moderation panel |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for students, by students**

<br/>

[⬆ Back to Top](#-noteveda)

</div>

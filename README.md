# SupaSupa

A modern web application built with Next.js and Supabase, featuring authentication and a dashboard interface.

## Features

- User authentication with Supabase
- Protected dashboard route
- Modern UI with Tailwind CSS
- TypeScript support
- Responsive design

## Getting Started

### Prerequisites

- Node.js 16.x or later
- pnpm (recommended) or npm
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd SupaSupa
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   │   └── login/         # Login page
│   └── dashboard/         # Protected dashboard
├── lib/                   # Shared libraries
│   └── supabase.ts        # Supabase client
└── components/            # Shared components
```

## Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

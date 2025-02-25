# SupaSupa

A modern web application built with Next.js and Supabase, featuring authentication and a dashboard interface.

## Features

- User authentication with Supabase
- Protected dashboard route
- Modern UI with Tailwind CSS
- TypeScript support
- Responsive design
- Task/Quest management system
- Enhanced award system with child-specific visibility, redemption limits, and lockout periods
- Customizable bonus awards with icon and color selection

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

## Database Schema Update

The project database schema has been updated to support new features, including the Quest Card integration. A new **tasks** table has been introduced to record and track quests. This table includes the following fields:
- **id** (uuid, auto-generated): Unique identifier for each task.
- **title** (text): The title of the quest.
- **description** (text): A description of the quest.
- **reward_points** (integer): Points awarded upon completion.
- **frequency** (text): Accepts "daily", "weekly", or "one-off" to indicate how often the task repeats.
- **status** (text): Accepts "assigned", "pending approval", "completed", or "rejected" to show the task's progress.
- **assigned_child_id** (uuid): References the child who is assigned the task.
- **created_by** (uuid): References the parent who created the task.
- **created_at / updated_at** (timestamps): Track when the task was created and last updated.

### Bonus Awards

The **bonus_awards** table has been enhanced with a new **color** column to support customizable icon colors:
- **color** (varchar): Stores a hex color code for the bonus award icon.

This allows parents to create more visually appealing and distinctive bonus awards by selecting both custom icons and colors.

For detailed schema information, see [Docs/database_schema.md](Docs/database_schema.md).
For information about the enhanced award system, see [docs/Features/EnhancedAwardSystem.md](docs/Features/EnhancedAwardSystem.md).

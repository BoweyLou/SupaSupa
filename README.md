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
- Brutalist design system with customizable cards, colors, and icons
- Expanded icon categories for kids' activities, chores, and school tasks
- Responsive card system optimized for mobile, tablet, and desktop devices

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
docs/                      # Documentation
├── database_schema.md     # Database schema documentation
├── database_functions.md  # Database functions documentation
└── database_relationships.md # Database relationships documentation
```

## Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Documentation

Comprehensive documentation about the SupaSupa application is available in the `docs/` directory:

- [Database Schema](docs/database_schema.md) - Detailed information about all tables in the database
- [Database Functions](docs/database_functions.md) - Documentation of all database functions
- [Database Relationships](docs/database_relationships.md) - Overview of the relationships between tables
- [Brutalist Design System](docs/BrutalistDesignSystem.md) - Information about the design system
- [Icon Selector](docs/IconSelector.md) - Guide to using icons for quests and awards
- [Responsive Card System](docs/ResponsiveCardSystem.md) - Details about the responsive card layout implementation

See the [Documentation README](docs/README.md) for more information.

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
- **icon** (text): Stores the name of the icon to display on the card.
- **custom_colors** (jsonb): Stores custom colors for the card border, background, and shadow.

### Bonus Awards

The **bonus_awards** table has been enhanced with a new **color** column to support customizable icon colors:
- **color** (varchar): Stores a hex color code for the bonus award icon.

This allows parents to create more visually appealing and distinctive bonus awards by selecting both custom icons and colors.

### Awards

The **awards** table has been updated with new fields to support the brutalist design system:
- **icon** (text): Stores the name of the icon to display on the card.
- **custom_colors** (jsonb): Stores custom colors for the card border, background, and shadow.

## Brutalist Design System

The application now features a brutalist design system that provides a bold, geometric aesthetic with high contrast and customizable elements. Key features include:

- Customizable card components with thick borders and drop shadows
- Status indicators for different states (pending, completed, failed, locked)
- Brutalist buttons with hover and active states
- Styled form elements and modals
- Color pickers for customizing card appearances
- Icon selectors for choosing from a library of icons, including kid-friendly categories:
  - Chores (cleaning, bed making, dishes, etc.)
  - School activities (homework, reading, writing, etc.)
  - General activities (biking, cooking, movies, etc.)

### Responsive Card System

The application features a fully responsive card system that adapts to different screen sizes:
- Mobile devices (up to 480px): 1 card per row with optimized sizing
- Small tablets (481px to 768px): 2 cards per row
- Large tablets (769px to 1024px): 3 cards per row
- Desktop (1025px and above): 4 cards per row

Components automatically adjust their layout, spacing, and element sizes based on the viewport, ensuring an optimal user experience across all devices.

For detailed information about the brutalist design system, see [docs/BrutalistDesignSystem.md](docs/BrutalistDesignSystem.md).
For a complete guide to available icons, see [docs/IconSelector.md](docs/IconSelector.md).
For details about the responsive card system, see [docs/ResponsiveCardSystem.md](docs/ResponsiveCardSystem.md).

For detailed schema information, see [docs/database_schema.md](docs/database_schema.md).
For information about the enhanced award system, see [docs/Features/EnhancedAwardSystem.md](docs/Features/EnhancedAwardSystem.md).

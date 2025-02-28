# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Responsive card system
  - Implemented CSS Grid layout for responsive card grids 
  - Created CardGrid component for consistent card layouts
  - Updated QuestCard component to adapt to different screen sizes
  - Enhanced StarDisplay component with responsive star sizing and layout
  - Created detailed documentation in `docs/ResponsiveCardSystem.md`
  - Optimized layout for mobile, tablet, and desktop viewports
  - Added screen size detection for adaptive component rendering
  - Improved performance through responsive image and component sizing
  - Implemented CardGrid across all dashboard sections for consistent UI
  - Enhanced CompletedTaskCard to display child name for better context
- Brutalist design system
  - Created new brutalist CSS styles in `src/app/brutalist.css`
  - Updated AwardCard and QuestCard components to use brutalist design
  - Added support for custom icons and colors in cards
  - Created comprehensive documentation in `docs/BrutalistDesignSystem.md`
  - Added database migration for new icon and custom_colors fields
  - Updated ThemeProvider integration for consistent styling
- Comprehensive database documentation
  - Created detailed database schema documentation in `docs/database_schema.md`
  - Added database functions documentation in `docs/database_functions.md`
  - Created database relationships documentation with ERD in `docs/database_relationships.md`
  - Added documentation README with navigation guide in `docs/README.md`
  - Updated main README.md to reference the new documentation
- Color selection feature for bonus awards
  - Added color column to bonus_awards table
  - Updated BonusAwardCard, BonusAwardCardSimple, and AddBonusAward components to support custom colors
  - Added color picker grid in the UI for easy color selection
  - Made icons smaller for better visual appearance
- Updated documentation to reflect new color selection feature
  - Enhanced EnhancedAwardSystem.md with color selection details
  - Added bonus awards section to README.md

### Changed
- Redesigned AwardCard and QuestCard components with brutalist styling
- Updated database schema to support custom icons and colors
- Enhanced ThemeCustomizer with icon selection capabilities
- Reduced icon size in bonus award cards for better visual balance
- Improved UI for bonus award creation and editing with color preview
- Reorganized documentation structure for better maintainability

## [1.0.0] - 2024-02-24

### Added
- Initial release with core features
- User authentication with Supabase
- Dashboard interface
- Task/Quest management system
- Enhanced award system with child-specific visibility, redemption limits, and lockout periods 
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Color selection feature for bonus awards
  - Added color column to bonus_awards table
  - Updated BonusAwardCard, BonusAwardCardSimple, and AddBonusAward components to support custom colors
  - Added color picker grid in the UI for easy color selection
  - Made icons smaller for better visual appearance
- Updated documentation to reflect new color selection feature
  - Enhanced EnhancedAwardSystem.md with color selection details
  - Added bonus awards section to README.md

### Changed
- Reduced icon size in bonus award cards for better visual balance
- Improved UI for bonus award creation and editing with color preview

## [1.0.0] - 2024-02-24

### Added
- Initial release with core features
- User authentication with Supabase
- Dashboard interface
- Task/Quest management system
- Enhanced award system with child-specific visibility, redemption limits, and lockout periods 
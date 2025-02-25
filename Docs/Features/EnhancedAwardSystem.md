# Enhanced Award System

This document describes the enhanced award system features that allow for more flexible and powerful reward management.

## Features

### 1. Child-Specific Visibility/Redemption

Awards can now be configured to be visible and redeemable by specific children. This allows parents to create personalized rewards for individual children or groups of children.

- **All Children**: By default, awards are visible to all children in the family.
- **Specific Children**: Parents can select which children can see and redeem specific awards.

### 2. Redemption Limits

Awards can now have different redemption limits:

- **Once Only**: The default behavior - an award can only be redeemed once.
- **Unlimited**: An award can be redeemed an unlimited number of times.
- **Custom Limit**: An award can be redeemed a specific number of times (e.g., 3 times).

### 3. Lock-out Periods

After an award is redeemed, it can be configured to become temporarily unavailable for a specified period:

- **No Lock-out**: The award is immediately available for redemption again (if it has multiple redemptions).
- **Days/Weeks**: The award becomes unavailable for a specified number of days or weeks after redemption.

### 4. Customizable Bonus Awards

Bonus awards can now be customized with:

- **Icon Selection**: Choose from a variety of icons to represent different types of achievements.
- **Custom Colors**: Select custom colors for icons to make them more visually appealing and distinctive.
- **Flexible Points**: Assign any point value to bonus awards based on the significance of the achievement.

## How It Works

### Database Schema

The award system uses the following database tables and columns:

- **awards table**:
  - `allowed_children_ids`: Array of child IDs who can see/redeem the award
  - `redemption_limit`: Number of times the award can be redeemed (null for unlimited)
  - `redemption_count`: Current count of redemptions
  - `lockout_period`: Duration value for lockout
  - `lockout_unit`: Unit for lockout period ('days' or 'weeks')
  - `last_redeemed_at`: Timestamp when the award was last redeemed

- **award_redemptions table**:
  - Tracks individual redemption instances
  - Allows for detailed history of award redemptions

- **bonus_awards table**:
  - `title`: Name of the bonus award
  - `icon`: Selected icon identifier
  - `color`: Custom color for the icon (hex code)
  - `points`: Points value of the bonus award
  - `status`: Current status of the award ('available' or 'awarded')

### Availability Calculation

An award is considered available for redemption if:

1. The child is allowed to see/redeem it (based on `allowed_children_ids`)
2. It has not reached its redemption limit (based on `redemption_limit` and `redemption_count`)
3. It is not in a lockout period (based on `last_redeemed_at`, `lockout_period`, and `lockout_unit`)

### User Interface

#### Parent View

Parents can:
- Create awards with specific visibility, redemption limits, and lockout periods
- Edit existing awards to modify these settings
- See which children can redeem specific awards
- Track redemption counts for awards
- Create and customize bonus awards with different icons and colors

#### Child View

Children:
- Only see awards they are allowed to redeem
- See the redemption status of awards (e.g., "3 of 5 redemptions remaining")
- See when locked-out awards will become available again
- Cannot redeem awards that are in a lockout period or have reached their redemption limit
- See visually appealing bonus awards with custom icons and colors

## Implementation Details

### Components

- **AwardCard**: Displays award information and handles redemption
- **AddAward**: Form for creating new awards with enhanced features
- **Awards**: Page that displays available awards to children
- **BonusAwardCard**: Displays bonus awards with customizable icons and colors
- **BonusAwardCardSimple**: Simplified version for child view
- **AddBonusAward**: Form for creating new bonus awards with icon and color selection

### Functions

- **is_award_available_for_child**: Database function that checks if an award is available for a specific child
- **claim_award_transaction**: Database function that handles award redemption and updates relevant counters

## Examples

### Example 1: Weekly Allowance

Create an award with:
- Unlimited redemptions
- 7-day lockout period
- Visible to all children

This creates a weekly allowance that can be claimed once per week.

### Example 2: Special One-Time Reward

Create an award with:
- Once-only redemption
- No lockout period
- Visible to a specific child

This creates a special one-time reward for a specific child.

### Example 3: Monthly Movie Night

Create an award with:
- Unlimited redemptions
- 30-day lockout period
- Visible to all children

This creates a monthly movie night reward that can be claimed once per month.

### Example 4: Customized Bonus Awards

Create bonus awards with:
- Different icons representing various achievements (e.g., Star for excellence, Trophy for winning)
- Custom colors to match the achievement type or child's preference
- Point values that reflect the significance of the achievement 
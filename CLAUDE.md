# Freizeiten Planner - Claude Instructions

## Project Overview
Web app for planning summer camps (Freizeiten) for children. Parents browse camps, select children, calculate costs with discounts, and save plans.

## Tech Stack
- **Frontend**: Vanilla HTML/CSS/JS (no build step, no framework)
- **CSS**: Pico CSS + custom overrides in `css/styles.css`
- **Calendar**: FullCalendar.js (v6.1.10)
- **Backend**: Xano (workspace ID: 1, AskSJ instance)
- **Hosting**: Cloudflare Pages

## Key Files
- `index.html` - Login/signup page
- `app.html` - Main application with planner, children, saved plans views
- `css/styles.css` - All custom styles (dark theme, grayscale UI)
- `js/calendar.js` - FullCalendar config + custom list view
- `js/planner.js` - Camp selection, cost calculation, early bird logic
- `js/i18n.js` - EN/DE translations
- `js/api.js` - Xano API calls
- `js/app.js` - Navigation, people management

## Deployment
```bash
# Always use manual deployment (GitHub auto-deploy unreliable)
npx wrangler pages deploy . --project-name=freizeiten-planner --branch=main
```

## Styling Conventions
- Use `--app-spacing` CSS variable for consistent padding (responsive: 1.5rem → 1rem → 5%)
- Use `--ui-accent` (#6b7280) for grayscale buttons/UI elements
- Colors reserved for calendar events only (3 camp sources: blue, green, purple)
- Pill-shaped buttons (`border-radius: 9999px`)
- Dark theme throughout

## Camp Sources & Colors
- **Kids Team**: `rgba(41, 82, 122, 0.85)` - dark blue
- **Neues Leben**: `rgba(46, 99, 64, 0.85)` - dark green
- **Schloss Klaus**: `rgba(88, 62, 111, 0.85)` - dark purple

## Database (Xano)
Key tables: `users`, `people`, `freizeiten`, `selections`

Early bird fields in freizeiten:
- `kosten_fruehbucher` - early bird price
- `fruehbucher_bis` - deadline date

## Important Notes
- FullCalendar doesn't support true continuous multi-month view (boundary dates repeat)
- Custom list view in `calendar.js` provides continuous camp browsing
- Calendar header is custom HTML (not FullCalendar's headerToolbar)
- Always test both Calendar and List views after changes

## Live URL
https://freizeiten.asksj.com

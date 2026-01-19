# Freizeiten Planner - Project Status

## Overview
A web app for planning summer camps (Freizeiten) for children. Parents can browse available camps, select which children attend which camps, calculate costs with sibling discounts and early bird pricing, and save/load plans.

## Tech Stack
- **Frontend**: Vanilla HTML/CSS/JS (no build step)
- **CSS Framework**: Pico CSS with custom overrides
- **Calendar**: FullCalendar.js
- **Backend**: Xano (workspace ID: 1, AskSJ)
- **Hosting**: Cloudflare Pages (freizeiten.asksj.com)
- **Deployment**: Manual via `npx wrangler pages deploy . --project-name=freizeiten-planner --branch=main`

## Project Structure
```
/Users/sj/Claude/projects/freizeiten-planner/
├── index.html          # Login/signup page
├── app.html            # Main application
├── css/
│   └── styles.css      # All custom styles
├── js/
│   ├── api.js          # Xano API calls
│   ├── auth.js         # Authentication logic
│   ├── calendar.js     # FullCalendar setup and custom list view
│   ├── planner.js      # Camp selection, cost calculation
│   ├── i18n.js         # Internationalization (EN/DE)
│   └── app.js          # Main app logic, navigation
└── _headers            # Cloudflare headers config
```

## Features Completed

### Core Functionality
- [x] User authentication (login/signup)
- [x] Add/edit/delete children with birthdates
- [x] Browse camps in calendar view (monthly)
- [x] Browse camps in list view (sorted by start date)
- [x] Select children, then select camps for those children
- [x] Age eligibility filtering (camps only show for eligible children)
- [x] Calculate total costs with sibling discounts
- [x] Early bird pricing support (deadline-based)
- [x] Save and load plans
- [x] Clear selections

### UI/UX
- [x] Dark theme with grayscale UI, colors only for calendar events
- [x] EN/DE language switcher (toggle style)
- [x] Responsive layout (desktop/tablet/mobile breakpoints)
- [x] Consistent spacing via `--app-spacing` CSS variable
- [x] Pill-shaped buttons throughout
- [x] Sort children by oldest/youngest first (both pages)
- [x] Expanded view modal for selected camps (80% screen)
- [x] Custom calendar header: month name left, nav arrows + view toggle right
- [x] View toggle with icons (📅 calendar, ☰ list)
- [x] Calendar auto-jumps to first month with events

### Calendar Styling
- [x] Dark theme for calendar
- [x] White text for day numbers and weekday headers
- [x] Muted, darker colors for camp event bars
- [x] 4px padding on event text for readability
- [x] 100px minimum day cell height
- [x] Dark backgrounds for list view (FullCalendar's built-in, though we use custom list now)

### Camp Sources (color-coded)
- Kids Team: Dark blue (`rgba(41, 82, 122, 0.85)`)
- Neues Leben: Dark green (`rgba(46, 99, 64, 0.85)`)
- Schloss Klaus: Dark purple (`rgba(88, 62, 111, 0.85)`)

## Database Schema (Xano)

### Tables
- **users**: id, name, email, password
- **people**: id, user_id, name, birthdate
- **freizeiten**: id, name, source, start_date, end_date, location, address, min_age, max_age, kosten, kosten_geschwister, kosten_fruehbucher, fruehbucher_bis, description, note, available_spots, registration_deadline, details_url, registration_url
- **selections**: id, user_id, name, created_at, data (JSON with camp/people selections)

## Known Issues / Future Enhancements

### Potential Improvements
- [ ] Multi-month continuous calendar view (FullCalendar doesn't support this natively without repeated boundary dates)
- [ ] Export plans to PDF
- [ ] Email reminders for registration deadlines
- [ ] Integration with camp registration systems
- [ ] Conflict detection (same child, overlapping dates)

### Notes
- FullCalendar's multiMonth view repeats boundary dates between months - not a true continuous view
- The custom list view provides a better continuous experience for browsing all camps
- GitHub auto-deploy to Cloudflare Pages sometimes doesn't trigger; use manual deployment

## Deployment Commands
```bash
# Commit and push
git add -A && git commit -m "Your message" && git push origin main

# Deploy to Cloudflare Pages
npx wrangler pages deploy . --project-name=freizeiten-planner --branch=main
```

## Live URL
https://freizeiten.asksj.com

---
*Last updated: January 2026*

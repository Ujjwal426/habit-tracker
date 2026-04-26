# Habit Tracker

A modern habit tracking application built with Next.js, TypeScript, and MongoDB.

## Features

- **Authentication**: Secure login and signup with NextAuth.js
- **Habit Management**: Create, edit, and delete habits with customizable frequencies
- **Daily Check-ins**: Track your progress daily with intuitive check-in interface
- **Monthly Overview**: Visual calendar view of your habit completion
- **Dashboard Analytics**: Comprehensive statistics and progress tracking
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, MongoDB with Mongoose
- **Authentication**: NextAuth.js with credentials provider
- **Database**: MongoDB

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or cloud)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd habit-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/habit-tracker
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `MONGODB_URI`: Your MongoDB connection string
- `NEXTAUTH_URL`: The URL of your application (http://localhost:3000 for development)
- `NEXTAUTH_SECRET`: A secret key for NextAuth.js (generate with: `openssl rand -base64 32`)

## Project Structure

```
habit-tracker/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── DashboardStats.tsx
│   ├── DailyCheckIn.tsx
│   ├── HabitForm.tsx
│   ├── HabitsList.tsx
│   └── MonthlyOverview.tsx
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   └── mongodb.ts        # MongoDB connection
├── models/                # Mongoose models
│   ├── Habit.ts
│   └── User.ts
├── middleware.ts          # Next.js middleware
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Usage

1. **Sign Up**: Create a new account with your email and password
2. **Add Habits**: Create habits with custom frequencies (daily, weekly, custom days, etc.)
3. **Daily Check-ins**: Mark habits as complete each day
4. **Track Progress**: View your progress in the dashboard and monthly overview
5. **Analyze Performance**: Monitor completion rates and streaks

## Features in Detail

### Habit Management
- Create habits with names, descriptions, and categories
- Set custom frequencies (daily, weekly, weekdays, weekends, custom days)
- Define target counts for each habit
- Color-code habits for easy identification

### Daily Check-ins
- See only habits scheduled for the current day
- Mark habits as complete with a single click
- Track counts for habits with multiple targets
- View daily progress statistics

### Monthly Overview
- Calendar view of habit completions
- Month and year selection
- Completion rate statistics
- Visual indicators for completed habits

### Dashboard Analytics
- Current and best streak tracking
- Overall completion rate
- Progress charts
- Habit performance comparison

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

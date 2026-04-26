const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date, amount) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
};

export const getDayLabel = (dayIndex) => DAY_LABELS[dayIndex];
export const getDayName = (dayIndex) => DAY_NAMES[dayIndex];

const LEGACY_FREQUENCY_MAP = {
  weekdays: [1, 2, 3, 4, 5],
  weekends: [0, 6],
  'mon-wed-fri': [1, 3, 5],
  'tue-thu': [2, 4],
  'mon-sat': [1, 2, 3, 4, 5, 6],
  weekly: [1],
};

export const normalizeHabit = (habit) => {
  if (!habit) {
    return habit;
  }

  if (habit.frequency === 'daily') {
    return { ...habit, customDays: [0, 1, 2, 3, 4, 5, 6] };
  }

  if (LEGACY_FREQUENCY_MAP[habit.frequency]) {
    return {
      ...habit,
      frequency: 'custom',
      customDays: LEGACY_FREQUENCY_MAP[habit.frequency],
    };
  }

  if (habit.frequency === 'alternate-days') {
    return {
      ...habit,
      frequency: 'every-x-days',
      everyXDays: 2,
    };
  }

  return {
    everyXDays: 1,
    ...habit,
    customDays: habit.customDays || [],
  };
};

export const getFrequencyLabel = (habit) => {
  const normalizedHabit = normalizeHabit(habit);

  switch (normalizedHabit.frequency) {
    case 'daily':
      return 'Daily';
    case 'custom':
      return normalizedHabit.customDays.length
        ? normalizedHabit.customDays.map(getDayLabel).join(', ')
        : 'Custom days';
    case 'every-x-days':
      return normalizedHabit.everyXDays === 2
        ? 'Alternate days'
        : `Every ${normalizedHabit.everyXDays} days`;
    case 'monthly':
      return `Monthly on day ${normalizedHabit.monthlyDay || 1}`;
    default:
      return normalizedHabit.frequency;
  }
};

export const isHabitScheduledOnDate = (habit, dateInput) => {
  const normalizedHabit = normalizeHabit(habit);
  const date = typeof dateInput === 'string' ? parseDateKey(dateInput) : dateInput;
  const dayOfWeek = date.getDay();

  switch (normalizedHabit.frequency) {
    case 'daily':
      return true;
    case 'custom':
      return normalizedHabit.customDays.includes(dayOfWeek);
    case 'every-x-days': {
      const anchorDate = normalizedHabit.startDate
        ? parseDateKey(normalizedHabit.startDate)
        : normalizedHabit.createdAt
          ? startOfDay(new Date(normalizedHabit.createdAt))
          : startOfDay(new Date());
      const diffMs = startOfDay(date).getTime() - startOfDay(anchorDate).getTime();
      const diffDays = Math.floor(diffMs / 86400000);
      return diffDays >= 0 && diffDays % Math.max(normalizedHabit.everyXDays || 1, 1) === 0;
    }
    case 'monthly':
      return date.getDate() === (normalizedHabit.monthlyDay || 1);
    default:
      return true;
  }
};

export const getDateRange = (startDate, endDate) => {
  const dates = [];
  let cursor = startOfDay(startDate);
  const end = startOfDay(endDate);

  while (cursor <= end) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return dates;
};

export const getDatesForPeriod = (period, endDate = new Date()) => {
  const end = startOfDay(endDate);
  let start = end;

  switch (period) {
    case 'week':
      start = addDays(end, -6);
      break;
    case 'month':
      start = new Date(end.getFullYear(), end.getMonth(), 1);
      break;
    case 'year':
      start = new Date(end.getFullYear(), 0, 1);
      break;
    default:
      start = addDays(end, -29);
  }

  return getDateRange(start, end);
};

export const getHabitDayStatus = (habit, checkIns, dateKey) => {
  if (!isHabitScheduledOnDate(habit, dateKey)) {
    return 'not-scheduled';
  }

  return checkIns[dateKey]?.[habit.id] ? 'completed' : 'missed';
};

export const calculateHabitStats = (habit, checkIns, dates) => {
  const normalizedHabit = normalizeHabit(habit);
  const scheduledDates = dates.filter((date) => isHabitScheduledOnDate(normalizedHabit, date));
  const scheduledDateKeys = scheduledDates.map(formatDateKey);
  const completedDates = scheduledDateKeys.filter((dateKey) => checkIns[dateKey]?.[normalizedHabit.id]);
  const missedDates = scheduledDateKeys.filter((dateKey) => !checkIns[dateKey]?.[normalizedHabit.id]);
  const accuracy = scheduledDateKeys.length
    ? Math.round((completedDates.length / scheduledDateKeys.length) * 100)
    : 0;

  let currentStreak = 0;
  for (let index = scheduledDateKeys.length - 1; index >= 0; index -= 1) {
    if (checkIns[scheduledDateKeys[index]]?.[normalizedHabit.id]) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  let longestStreak = 0;
  let runningStreak = 0;
  scheduledDateKeys.forEach((dateKey) => {
    if (checkIns[dateKey]?.[normalizedHabit.id]) {
      runningStreak += 1;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
  });

  return {
    scheduledCount: scheduledDateKeys.length,
    completedCount: completedDates.length,
    missedCount: missedDates.length,
    accuracy,
    currentStreak,
    longestStreak,
    scheduledDateKeys,
    completedDates,
    missedDates,
  };
};

export const getMonthDates = (year, monthIndex) => {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  return getDateRange(firstDay, lastDay);
};

export const getMonthSummary = (habit, checkIns, year, monthIndex) =>
  calculateHabitStats(habit, checkIns, getMonthDates(year, monthIndex));

export const getBestAndWorstHabits = (habits, checkIns, dates) => {
  const stats = habits.map((habit) => ({
    habit,
    stats: calculateHabitStats(habit, checkIns, dates),
  })).filter(({ stats }) => stats.scheduledCount > 0);

  if (!stats.length) {
    return { bestHabit: null, worstHabit: null };
  }

  const sorted = [...stats].sort((left, right) => right.stats.accuracy - left.stats.accuracy);
  return {
    bestHabit: sorted[0],
    worstHabit: sorted[sorted.length - 1],
  };
};

export const getHabitInsight = (habit, checkIns, dates) => {
  const normalizedHabit = normalizeHabit(habit);
  const scheduledDates = dates.filter((date) => isHabitScheduledOnDate(normalizedHabit, date));

  if (!scheduledDates.length) {
    return 'No scheduled days in this period yet.';
  }

  const missedByDay = new Map();
  let slidingMisses = 0;
  let postStreakDrop = false;

  scheduledDates.forEach((date) => {
    const dateKey = formatDateKey(date);
    const day = date.getDay();
    const completed = Boolean(checkIns[dateKey]?.[normalizedHabit.id]);

    if (!completed) {
      missedByDay.set(day, (missedByDay.get(day) || 0) + 1);
      slidingMisses += 1;
    } else {
      slidingMisses = 0;
    }

    if (slidingMisses >= 2) {
      postStreakDrop = true;
    }
  });

  const mostMissedEntry = [...missedByDay.entries()].sort((a, b) => b[1] - a[1])[0];
  if (mostMissedEntry && mostMissedEntry[1] > 0) {
    return `You miss ${normalizedHabit.name} most often on ${getDayName(mostMissedEntry[0])}s.`;
  }

  if (postStreakDrop) {
    return `Your ${normalizedHabit.name} consistency drops after a short streak. Try protecting recovery days.`;
  }

  return `${normalizedHabit.name} is showing steady consistency in this period.`;
};

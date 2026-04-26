class HabitTracker {
    constructor() {
        this.goals = [];
        this.checkIns = {};
        this.currentSection = 'goals';
        this.editingGoalId = null;
        this.progressChart = null;
        this.performanceChart = null;
        this.selectedColor = '#6366f1';
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderGoals();
        this.renderDailyHabits();
        this.renderMonthlyCalendar();
        this.updateDashboard();
        this.setupDateSelectors();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.switchSection(section);
            });
        });

        // Goal Management
        document.getElementById('add-goal-btn').addEventListener('click', () => {
            this.openGoalModal();
        });

        document.getElementById('goal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveGoal();
        });

        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeGoalModal();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.closeGoalModal();
        });

        // Daily Date Change
        document.getElementById('daily-date').addEventListener('change', () => {
            this.renderDailyHabits();
        });

        // Month/Year Change
        document.getElementById('month-select').addEventListener('change', () => {
            this.renderMonthlyCalendar();
        });

        document.getElementById('year-select').addEventListener('change', () => {
            this.renderMonthlyCalendar();
        });

        // Dashboard Period Selector
        document.querySelectorAll('.period-selector button').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.period-selector button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateDashboard(btn.dataset.period);
            });
        });

        // Modal backdrop click
        document.getElementById('goal-modal').addEventListener('click', (e) => {
            if (e.target.id === 'goal-modal') {
                this.closeGoalModal();
            }
        });

        // Color selector
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedColor = option.dataset.color;
            });
        });

        // Set default color selection
        document.querySelector('.color-option').classList.add('selected');
    }

    setupDateSelectors() {
        // Set today's date as default for daily view
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('daily-date').value = today;

        // Setup month selector
        const monthSelect = document.getElementById('month-select');
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
        
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = month;
            if (index === new Date().getMonth()) {
                option.selected = true;
            }
            monthSelect.appendChild(option);
        });

        // Setup year selector
        const yearSelect = document.getElementById('year-select');
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 2; year <= currentYear + 2; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) {
                option.selected = true;
            }
            yearSelect.appendChild(option);
        }
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === section) {
                link.classList.add('active');
            }
        });

        // Update content sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        this.currentSection = section;

        // Refresh section-specific content
        if (section === 'dashboard') {
            this.updateDashboard();
        }
    }

    updateFrequencyOptions() {
        const frequency = document.getElementById('goal-frequency').value;
        const customDaysGroup = document.getElementById('custom-days-group');
        
        if (frequency === 'custom') {
            customDaysGroup.style.display = 'block';
        } else {
            customDaysGroup.style.display = 'none';
        }
    }

    openGoalModal(goalId = null) {
        const modal = document.getElementById('goal-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('goal-form');

        if (goalId) {
            const goal = this.goals.find(g => g.id === goalId);
            if (goal) {
                modalTitle.textContent = 'Edit Goal';
                document.getElementById('goal-name').value = goal.name;
                document.getElementById('goal-description').value = goal.description || '';
                document.getElementById('goal-category').value = goal.category;
                document.getElementById('goal-frequency').value = goal.frequency;
                document.getElementById('goal-target').value = goal.target;
                
                // Set color
                this.selectedColor = goal.color || '#6366f1';
                document.querySelectorAll('.color-option').forEach(opt => {
                    opt.classList.remove('selected');
                    if (opt.dataset.color === this.selectedColor) {
                        opt.classList.add('selected');
                    }
                });
                
                // Set custom days if applicable
                this.updateFrequencyOptions();
                if (goal.frequency === 'custom' && goal.customDays) {
                    document.querySelectorAll('input[name="custom-days"]').forEach(checkbox => {
                        checkbox.checked = goal.customDays.includes(parseInt(checkbox.value));
                    });
                }
                
                this.editingGoalId = goalId;
            }
        } else {
            modalTitle.textContent = 'Add New Goal';
            form.reset();
            this.editingGoalId = null;
            this.selectedColor = '#6366f1';
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            document.querySelector('.color-option').classList.add('selected');
            this.updateFrequencyOptions();
        }

        modal.classList.add('active');
    }

    closeGoalModal() {
        document.getElementById('goal-modal').classList.remove('active');
        document.getElementById('goal-form').reset();
        this.editingGoalId = null;
    }

    saveGoal() {
        const frequency = document.getElementById('goal-frequency').value;
        let customDays = [];
        
        if (frequency === 'custom') {
            document.querySelectorAll('input[name="custom-days"]:checked').forEach(checkbox => {
                customDays.push(parseInt(checkbox.value));
            });
        }

        const goalData = {
            name: document.getElementById('goal-name').value,
            description: document.getElementById('goal-description').value,
            category: document.getElementById('goal-category').value,
            frequency: frequency,
            target: parseInt(document.getElementById('goal-target').value),
            color: this.selectedColor,
            customDays: customDays,
            createdAt: new Date().toISOString()
        };

        if (this.editingGoalId) {
            const index = this.goals.findIndex(g => g.id === this.editingGoalId);
            this.goals[index] = { ...this.goals[index], ...goalData };
        } else {
            goalData.id = Date.now().toString();
            this.goals.push(goalData);
        }

        this.saveData();
        this.renderGoals();
        this.renderDailyHabits();
        this.renderMonthlyCalendar();
        this.updateDashboard();
        this.closeGoalModal();
    }

    deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.goals = this.goals.filter(g => g.id !== goalId);
            
            // Clean up check-ins for deleted goal
            Object.keys(this.checkIns).forEach(date => {
                if (this.checkIns[date][goalId]) {
                    delete this.checkIns[date][goalId];
                }
            });

            this.saveData();
            this.renderGoals();
            this.renderDailyHabits();
            this.renderMonthlyCalendar();
            this.updateDashboard();
        }
    }

    renderGoals() {
        const container = document.getElementById('goals-container');
        
        if (this.goals.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class="fas fa-bullseye" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">No goals yet</h3>
                    <p style="color: var(--text-secondary);">Start by adding your first goal to track!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.goals.map(goal => {
            const frequencyText = this.getFrequencyDisplayText(goal);
            const goalColor = goal.color || '#6366f1';
            
            return `
                <div class="goal-card" style="border-left-color: ${goalColor};">
                    <div class="goal-header">
                        <h3 class="goal-title">${goal.name}</h3>
                        <div class="goal-actions">
                            <button onclick="habitTracker.openGoalModal('${goal.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="habitTracker.deleteGoal('${goal.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
                    <div class="goal-meta">
                        <span class="goal-category">${goal.category}</span>
                        <span class="goal-frequency" style="background: ${goalColor};">${frequencyText} (${goal.target}x)</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    getFrequencyDisplayText(goal) {
        switch(goal.frequency) {
            case 'daily': return 'Daily';
            case 'weekly': return 'Weekly';
            case 'weekdays': return 'Weekdays';
            case 'weekends': return 'Weekends';
            case 'mon-wed-fri': return 'Mon, Wed, Fri';
            case 'tue-thu': return 'Tue, Thu';
            case 'mon-sat': return 'Mon-Sat';
            case 'custom': 
                if (goal.customDays && goal.customDays.length > 0) {
                    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    return goal.customDays.map(day => dayNames[day]).join(', ');
                }
                return 'Custom';
            case 'monthly': return 'Monthly';
            default: return goal.frequency;
        }
    }

    renderDailyHabits() {
        const container = document.getElementById('daily-habits-container');
        const selectedDate = document.getElementById('daily-date').value;
        const selectedDateObj = new Date(selectedDate);
        const dayOfWeek = selectedDateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Filter goals based on frequency
        const todaysGoals = this.goals.filter(goal => this.isGoalScheduledForDay(goal, dayOfWeek, selectedDateObj));
        
        if (todaysGoals.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-calendar-day" style="font-size: 2rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-secondary);">No goals scheduled for today. Add some goals or check other days!</p>
                </div>
            `;
            return;
        }

        // Initialize check-ins for this date if not exists
        if (!this.checkIns[selectedDate]) {
            this.checkIns[selectedDate] = {};
        }

        container.innerHTML = todaysGoals.map(goal => {
            const isChecked = this.checkIns[selectedDate][goal.id] || false;
            const progress = this.getGoalProgress(goal.id, selectedDate);
            const goalColor = goal.color || '#6366f1';
            
            return `
                <div class="habit-item" style="border-left: 3px solid ${goalColor};">
                    <div class="habit-info">
                        <input 
                            type="checkbox" 
                            class="habit-checkbox" 
                            ${isChecked ? 'checked' : ''}
                            onchange="habitTracker.toggleHabit('${goal.id}', '${selectedDate}')"
                            style="accent-color: ${goalColor};"
                        >
                        <div>
                            <div class="habit-name">${goal.name}</div>
                            <span class="habit-category" style="background: ${goalColor}20; color: ${goalColor};">${goal.category}</span>
                        </div>
                    </div>
                    <div class="habit-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%; background: ${goalColor};"></div>
                        </div>
                        <span class="progress-text">${Math.round(progress)}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    isGoalScheduledForDay(goal, dayOfWeek, dateObj) {
        switch(goal.frequency) {
            case 'daily':
                return true;
            case 'weekly':
                // For weekly, we'll show it on the first day of the week (Monday)
                return dayOfWeek === 1;
            case 'weekdays':
                return dayOfWeek >= 1 && dayOfWeek <= 5;
            case 'weekends':
                return dayOfWeek === 0 || dayOfWeek === 6;
            case 'mon-wed-fri':
                return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
            case 'tue-thu':
                return dayOfWeek === 2 || dayOfWeek === 4;
            case 'mon-sat':
                return dayOfWeek >= 1 && dayOfWeek <= 6;
            case 'custom':
                return goal.customDays && goal.customDays.includes(dayOfWeek);
            case 'monthly':
                // For monthly, show on the 1st of each month
                return dateObj.getDate() === 1;
            default:
                return true;
        }
    }

    toggleHabit(goalId, date) {
        if (!this.checkIns[date]) {
            this.checkIns[date] = {};
        }
        
        this.checkIns[date][goalId] = !this.checkIns[date][goalId];
        
        this.saveData();
        this.renderDailyHabits();
        this.renderMonthlyCalendar();
        this.updateDashboard();
    }

    getGoalProgress(goalId, date) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return 0;

        // Get all dates up to and including the selected date
        const dates = Object.keys(this.checkIns).sort().filter(d => d <= date);
        
        let completedCount = 0;
        let totalCount = 0;

        dates.forEach(checkDate => {
            if (this.checkIns[checkDate][goalId]) {
                completedCount++;
            }
            totalCount++;
        });

        return totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    }

    renderMonthlyCalendar() {
        const container = document.getElementById('monthly-calendar-container');
        const month = parseInt(document.getElementById('month-select').value);
        const year = parseInt(document.getElementById('year-select').value);
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];

        let html = `
            <h3 style="text-align: center; margin-bottom: 1rem; color: var(--text-primary);">
                ${monthNames[month]} ${year}
            </h3>
            <div class="calendar-grid">
                <div class="calendar-header">Sun</div>
                <div class="calendar-header">Mon</div>
                <div class="calendar-header">Tue</div>
                <div class="calendar-header">Wed</div>
                <div class="calendar-header">Thu</div>
                <div class="calendar-header">Fri</div>
                <div class="calendar-header">Sat</div>
        `;

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            html += '<div></div>';
        }

        // Add days of the month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = today.getFullYear() === year && 
                           today.getMonth() === month && 
                           today.getDate() === day;
            
            const dayStatus = this.getDayStatus(dateStr);
            let dayClass = 'calendar-day';
            if (isToday) dayClass += ' today';
            if (dayStatus === 'completed') dayClass += ' completed';
            if (dayStatus === 'partial') dayClass += ' partial';

            html += `
                <div class="${dayClass}">
                    <div class="day-number">${day}</div>
                    <div class="day-indicator">${this.getDayIndicator(dateStr)}</div>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;
    }

    getDayStatus(dateStr) {
        if (!this.checkIns[dateStr] || Object.keys(this.checkIns[dateStr]).length === 0) {
            return 'empty';
        }

        const totalGoals = this.goals.length;
        const completedGoals = Object.values(this.checkIns[dateStr]).filter(Boolean).length;

        if (completedGoals === 0) return 'empty';
        if (completedGoals === totalGoals) return 'completed';
        return 'partial';
    }

    getDayIndicator(dateStr) {
        const status = this.getDayStatus(dateStr);
        switch (status) {
            case 'completed': return '✓';
            case 'partial': return '○';
            default: return '';
        }
    }

    updateDashboard(period = 'month') {
        this.updateStats(period);
        this.updateCharts(period);
    }

    updateStats(period) {
        const stats = this.calculateStats(period);
        
        document.getElementById('current-streak').textContent = stats.currentStreak;
        document.getElementById('completion-rate').textContent = `${stats.completionRate}%`;
        document.getElementById('best-streak').textContent = stats.bestStreak;
        document.getElementById('total-completed').textContent = stats.totalCompleted;
    }

    calculateStats(period) {
        const today = new Date();
        const dates = this.getDatesForPeriod(period, today);
        
        let totalCompleted = 0;
        let totalPossible = 0;
        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;

        dates.forEach(date => {
            const dateStr = date.toISOString().split('T')[0];
            const dayCompleted = this.checkIns[dateStr] ? 
                Object.values(this.checkIns[dateStr]).filter(Boolean).length : 0;
            const dayTotal = this.goals.length;

            totalCompleted += dayCompleted;
            totalPossible += dayTotal;

            if (dayCompleted === dayTotal && dayTotal > 0) {
                tempStreak++;
                bestStreak = Math.max(bestStreak, tempStreak);
            } else {
                tempStreak = 0;
            }
        });

        // Calculate current streak (from today backwards)
        for (let i = dates.length - 1; i >= 0; i--) {
            const dateStr = dates[i].toISOString().split('T')[0];
            const dayCompleted = this.checkIns[dateStr] ? 
                Object.values(this.checkIns[dateStr]).filter(Boolean).length : 0;
            const dayTotal = this.goals.length;

            if (dayCompleted === dayTotal && dayTotal > 0) {
                currentStreak++;
            } else {
                break;
            }
        }

        return {
            currentStreak,
            bestStreak,
            totalCompleted,
            completionRate: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0
        };
    }

    getDatesForPeriod(period, endDate) {
        const dates = [];
        const startDate = new Date(endDate);

        switch (period) {
            case 'week':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(endDate.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
        }

        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }

    updateCharts(period) {
        this.updateProgressChart(period);
        this.updatePerformanceChart(period);
    }

    updateProgressChart(period) {
        const ctx = document.getElementById('progress-chart').getContext('2d');
        const dates = this.getDatesForPeriod(period, new Date());
        
        const labels = dates.map(date => {
            return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
        });

        const data = dates.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            const dayCompleted = this.checkIns[dateStr] ? 
                Object.values(this.checkIns[dateStr]).filter(Boolean).length : 0;
            const dayTotal = this.goals.length;
            return dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0;
        });

        if (this.progressChart) {
            this.progressChart.destroy();
        }

        this.progressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Completion Rate (%)',
                    data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    updatePerformanceChart(period) {
        const ctx = document.getElementById('performance-chart').getContext('2d');
        
        const goalPerformance = this.goals.map(goal => {
            const dates = this.getDatesForPeriod(period, new Date());
            let completed = 0;
            let total = dates.length;

            dates.forEach(date => {
                const dateStr = date.toISOString().split('T')[0];
                if (this.checkIns[dateStr] && this.checkIns[dateStr][goal.id]) {
                    completed++;
                }
            });

            return {
                name: goal.name,
                completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
            };
        });

        if (this.performanceChart) {
            this.performanceChart.destroy();
        }

        this.performanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: goalPerformance.map(g => g.name),
                datasets: [{
                    label: 'Completion Rate (%)',
                    data: goalPerformance.map(g => g.completionRate),
                    backgroundColor: goalPerformance.map((_, i) => {
                        const colors = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#22d3ee'];
                        return colors[i % colors.length];
                    })
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    saveData() {
        localStorage.setItem('habitTrackerGoals', JSON.stringify(this.goals));
        localStorage.setItem('habitTrackerCheckIns', JSON.stringify(this.checkIns));
    }

    loadData() {
        const savedGoals = localStorage.getItem('habitTrackerGoals');
        const savedCheckIns = localStorage.getItem('habitTrackerCheckIns');
        
        if (savedGoals) {
            this.goals = JSON.parse(savedGoals);
        }
        
        if (savedCheckIns) {
            this.checkIns = JSON.parse(savedCheckIns);
        }
    }
}

// Initialize the app
const habitTracker = new HabitTracker();

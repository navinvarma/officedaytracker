// Calendar-related types
export interface CalendarEvent {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    allDay: boolean;
    location?: string;
    notes?: string;
}

// Enhanced statistics types
export interface PeriodStats {
    workingDays: number;
    officeDays: number;
    percentage: number;
    period: string;
}

export interface QuarterConfig {
    Q1: number[]; // Array of month numbers (0-11) for Q1
    Q2: number[]; // Array of month numbers (0-11) for Q2
    Q3: number[]; // Array of month numbers (0-11) for Q3
    Q4: number[]; // Array of month numbers (0-11) for Q4
}

export interface StatisticsPeriod {
    type: 'month' | 'quarter' | 'year';
    value: string; // Month name, quarter name, or year
    startDate: Date;
    endDate: Date;
}

// Notification-related types
export interface NotificationData {
    type: 'office-reminder' | 'other';
    [key: string]: any;
}

export interface ReminderTime {
    hour: number;
    minute: number;
    identifier: string;
}

// App state types
export interface AppPermissions {
    calendar: boolean;
    notifications: boolean;
}

export interface OfficeDayStatus {
    isLoggedToday: boolean;
    lastLoggedDate?: Date;
}

// UI state types
export interface ButtonState {
    isLoading: boolean;
    isDisabled: boolean;
    text: string;
}


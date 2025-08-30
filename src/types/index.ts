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


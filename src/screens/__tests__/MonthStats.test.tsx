import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import MainScreen from '../MainScreen';
import * as Calendar from 'expo-calendar';

// Mock expo-calendar
jest.mock('expo-calendar', () => ({
    requestCalendarPermissionsAsync: jest.fn(),
    getCalendarsAsync: jest.fn(),
    getEventsAsync: jest.fn(),
    createEventAsync: jest.fn(),
    deleteEventAsync: jest.fn(),
    EntityTypes: {
        EVENT: 'event'
    }
}));

describe('Month Statistics', () => {
    const mockCalendar = {
        id: 'default-calendar-id',
        title: 'Default Calendar',
        isPrimary: true,
        entityType: 'event',
    };

    const augustEvents = [
        {
            id: 'event-1',
            title: 'Office Day',
            startDate: new Date('2025-08-01T00:00:00Z'),
            endDate: new Date('2025-08-02T00:00:00Z'),
            allDay: true,
            timeZone: 'UTC'
        },
        {
            id: 'event-2',
            title: 'Office Day',
            startDate: new Date('2025-08-03T00:00:00Z'),
            endDate: new Date('2025-08-04T00:00:00Z'),
            allDay: true,
            timeZone: 'UTC'
        },
        {
            id: 'event-3',
            title: 'Office Day',
            startDate: new Date('2025-08-05T00:00:00Z'),
            endDate: new Date('2025-08-06T00:00:00Z'),
            allDay: true,
            timeZone: 'UTC'
        },
        {
            id: 'event-4',
            title: 'Office Day',
            startDate: new Date('2025-08-07T00:00:00Z'),
            endDate: new Date('2025-08-08T00:00:00Z'),
            allDay: true,
            timeZone: 'UTC'
        },
        {
            id: 'event-5',
            title: 'Office Day',
            startDate: new Date('2025-08-10T00:00:00Z'),
            endDate: new Date('2025-08-11T00:00:00Z'),
            allDay: true,
            timeZone: 'UTC'
        },
        {
            id: 'event-6',
            title: 'Office Day',
            startDate: new Date('2025-08-12T00:00:00Z'),
            endDate: new Date('2025-08-13T00:00:00Z'),
            allDay: true,
            timeZone: 'UTC'
        },
        {
            id: 'event-7',
            title: 'Office Day',
            startDate: new Date('2025-08-15T00:00:00Z'),
            endDate: new Date('2025-08-16T00:00:00Z'),
            allDay: true,
            timeZone: 'UTC'
        }
    ];

    const mixedMonthEvents = [
        {
            id: 'event-1',
            title: 'Office Day',
            startDate: new Date('2025-08-15T00:00:00Z'),
            endDate: new Date('2025-08-16T00:00:00Z'),
            allDay: true,
            timeZone: 'UTC'
        },
        {
            id: 'event-2',
            title: 'Office Day',
            startDate: new Date('2025-07-20T00:00:00Z'),
            endDate: new Date('2025-07-21T00:00:00Z'),
            allDay: true,
            timeZone: 'UTC'
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        // Set up default mocks
        (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({
            status: 'granted'
        });

        (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue([mockCalendar]);

        // Mock getEventsAsync to return different values for different calls
        (Calendar.getEventsAsync as jest.Mock)
            .mockResolvedValueOnce([]) // First call (checkIfLoggedToday) - no events today
            .mockResolvedValueOnce(augustEvents); // Second call (loadPastOfficeDays) - august events
    });

    it('should count all office days including weekends in month statistics', async () => {
        const { getByText, getByTestId } = render(<MainScreen />);

        // Wait for the component to finish loading
        await waitFor(() => {
            expect(getByText('Office Day Tracker')).toBeTruthy();
        });

        // Wait for the calendar data to load
        await waitFor(() => {
            expect(Calendar.getEventsAsync).toHaveBeenCalledTimes(2);
        });



        // Open menu first
        const menuButton = getByText('☰');
        fireEvent.press(menuButton);

        // Wait for menu to appear and then open month statistics
        await waitFor(() => {
            const statsButton = getByText('📊 Month Statistics');
            fireEvent.press(statsButton);
        });

        // Wait for the modal to appear and check the statistics
        await waitFor(() => {
            expect(getByText('Month Statistics')).toBeTruthy();
        });

        // Wait a bit more for the statistics to calculate
        await new Promise(resolve => setTimeout(resolve, 100));

        // Now check the statistics - match the actual UI structure
        expect(getByText('Working Days (Mon-Fri)')).toBeTruthy();
        expect(getByText('21')).toBeTruthy(); // Working days count
        expect(getByText('Office Days')).toBeTruthy();
        expect(getByText('7')).toBeTruthy(); // Office days count
        expect(getByText('Attendance Rate')).toBeTruthy();
        expect(getByText('33%')).toBeTruthy(); // Attendance rate
    });

});

describe('Month Statistics - Mixed Months', () => {
    const mockCalendar = {
        id: 'default-calendar-id',
        title: 'Default Calendar',
        isPrimary: true,
        entityType: 'event',
    };

    const mixedMonthEvents = [
        {
            id: 'event-1',
            title: 'Office Day',
            startDate: new Date('2025-08-15T00:00:00Z'),
            endDate: new Date('2025-08-16T00:00:00Z'),
            allDay: true,
            timeZone: 'UTC'
        },
        {
            id: 'event-2',
            title: 'Office Day',
            startDate: new Date('2025-07-20T00:00:00Z'),
            endDate: new Date('2025-07-21T00:00:00Z'),
            allDay: true,
            timeZone: 'UTC'
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        // Set up mocks for this test suite
        (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({
            status: 'granted'
        });

        (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue([mockCalendar]);

        // Mock getEventsAsync for mixed month events
        (Calendar.getEventsAsync as jest.Mock)
            .mockResolvedValueOnce([]) // First call (checkIfLoggedToday) - no events today
            .mockResolvedValueOnce(mixedMonthEvents); // Second call (loadPastOfficeDays) - mixed month events
    });

    it('should only count office days from current month in statistics', async () => {
        const { getByText, getByTestId } = render(<MainScreen />);

        // Wait for the component to finish loading
        await waitFor(() => {
            expect(getByText('Office Day Tracker')).toBeTruthy();
        });

        // Wait for the calendar data to load
        await waitFor(() => {
            expect(Calendar.getEventsAsync).toHaveBeenCalledTimes(2);
        });

        // Open menu first
        const menuButton = getByText('☰');
        fireEvent.press(menuButton);

        // Wait for menu to appear and then open month statistics
        await waitFor(() => {
            const statsButton = getByText('📊 Month Statistics');
            fireEvent.press(statsButton);
        });

        // Wait for the modal to appear and check the statistics
        await waitFor(() => {
            expect(getByText('Month Statistics')).toBeTruthy();
        });

        // Wait a bit more for the statistics to calculate
        await new Promise(resolve => setTimeout(resolve, 100));

        // Now check the statistics - match the actual UI structure
        expect(getByText('Working Days (Mon-Fri)')).toBeTruthy();
        expect(getByText('21')).toBeTruthy(); // Working days count
        expect(getByText('Office Days')).toBeTruthy();
        expect(getByText('1')).toBeTruthy(); // Office days count
        expect(getByText('Attendance Rate')).toBeTruthy();
        expect(getByText('5%')).toBeTruthy(); // Attendance rate
    });
});

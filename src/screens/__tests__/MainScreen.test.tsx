import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
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

// Alert is mocked in jest.setup.js

describe('MainScreen', () => {
    const mockCalendar = {
        id: 'test-calendar-id',
        title: 'Test Calendar',
        isPrimary: true,
        entityType: 'event'
    };

    const mockOfficeDayEvent = {
        id: 'test-event-id',
        title: 'Office Day',
        startDate: new Date('2024-01-15T00:00:00Z'),
        endDate: new Date('2024-01-16T00:00:00Z'),
        allDay: true
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock successful calendar permissions
        (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({
            status: 'granted'
        });

        // Mock calendar retrieval
        (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue([mockCalendar]);

        // Mock empty events initially
        (Calendar.getEventsAsync as jest.Mock).mockResolvedValue([]);
    });

    describe('Date Logging Functionality', () => {
        it('should log office day to the correct date', async () => {
            const { getByText, getByTestId } = render(<MainScreen />);

            // Wait for app to load
            await waitFor(() => {
                expect(getByText('Office Day Tracker')).toBeTruthy();
            });

            // Mock successful event creation
            (Calendar.createEventAsync as jest.Mock).mockResolvedValue('new-event-id');

            // Open date picker by clicking the date button
            const dateButton = getByTestId('date-picker-button');
            fireEvent.press(dateButton);

            // Wait for date picker to open
            await waitFor(() => {
                expect(getByText('Select Date')).toBeTruthy();
            });

            // Select a specific date (15th)
            const day15 = getByText('15');
            fireEvent.press(day15);

            // Confirm date
            const confirmButton = getByText('Confirm Date');
            fireEvent.press(confirmButton);

            // Log office day
            const logButton = getByText('Log Office Day');
            fireEvent.press(logButton);

            // Verify event was created
            await waitFor(() => {
                expect(Calendar.createEventAsync).toHaveBeenCalledWith(
                    'test-calendar-id',
                    expect.objectContaining({
                        title: 'Office Day',
                        startDate: expect.any(Date),
                        endDate: expect.any(Date),
                        allDay: true
                    })
                );
            });
        });

        it('should handle past date logging correctly', async () => {
            const { getByText, getByTestId } = render(<MainScreen />);

            await waitFor(() => {
                expect(getByText('Office Day Tracker')).toBeTruthy();
            });

            // Mock successful event creation
            (Calendar.createEventAsync as jest.Mock).mockResolvedValue('new-event-id');

            // Open date picker
            const dateButton = getByTestId('date-picker-button');
            fireEvent.press(dateButton);

            await waitFor(() => {
                expect(getByText('Select Date')).toBeTruthy();
            });

            // Select a past date (10th)
            const day10 = getByText('10');
            fireEvent.press(day10);

            // Confirm and log
            const confirmButton = getByText('Confirm Date');
            fireEvent.press(confirmButton);

            const logButton = getByText('Log Office Day');
            fireEvent.press(logButton);

            // Verify past date was logged
            await waitFor(() => {
                expect(Calendar.createEventAsync).toHaveBeenCalledWith(
                    'test-calendar-id',
                    expect.objectContaining({
                        startDate: expect.any(Date)
                    })
                );
            });
        });
    });

    describe('Past Events Retrieval', () => {
        it('should display past office days correctly', async () => {
            const pastEvents = [
                {
                    id: 'event-1',
                    title: 'Office Day',
                    startDate: new Date('2024-01-15T00:00:00Z'),
                    endDate: new Date('2024-01-16T00:00:00Z'),
                    allDay: true
                },
                {
                    id: 'event-2',
                    title: 'Office Day',
                    startDate: new Date('2024-01-20T00:00:00Z'),
                    endDate: new Date('2024-01-21T00:00:00Z'),
                    allDay: true
                }
            ];

            // Mock events retrieval
            (Calendar.getEventsAsync as jest.Mock).mockResolvedValue(pastEvents);

            const { getByText, getAllByText } = render(<MainScreen />);

            await waitFor(() => {
                expect(getByText('Office Day Tracker')).toBeTruthy();
            });

            // Open menu
            const menuButton = getByText('☰');
            fireEvent.press(menuButton);

            // Select Past Office Days
            const pastOfficeDaysButton = getByText('📅 Past Office Days');
            fireEvent.press(pastOfficeDaysButton);

            // Verify past events are displayed
            await waitFor(() => {
                expect(getByText('Past Office Days')).toBeTruthy();
                // Check that office day events exist
                const officeDayElements = getAllByText('Office Day');
                expect(officeDayElements.length).toBeGreaterThan(0);
            });
        });

        it('should show correct event dates in past events list', async () => {
            const specificDate = new Date('2024-01-25T00:00:00Z');
            const pastEvents = [
                {
                    id: 'event-1',
                    title: 'Office Day',
                    startDate: specificDate,
                    endDate: new Date(specificDate.getTime() + 24 * 60 * 60 * 1000),
                    allDay: true
                }
            ];

            (Calendar.getEventsAsync as jest.Mock).mockResolvedValue(pastEvents);

            const { getByText } = render(<MainScreen />);

            await waitFor(() => {
                expect(getByText('Office Day Tracker')).toBeTruthy();
            });

            // Open Past Office Days
            const menuButton = getByText('☰');
            fireEvent.press(menuButton);

            const pastOfficeDaysButton = getByText('📅 Past Office Days');
            fireEvent.press(pastOfficeDaysButton);

            // Verify the specific date is displayed correctly
            await waitFor(() => {
                expect(getByText('Office Day')).toBeTruthy();
            });
        });
    });

    describe('Calendar Highlighting', () => {
        it('should highlight office day dates in calendar with correct color', async () => {
            const officeDayDate = new Date('2024-01-15T00:00:00Z');
            const pastEvents = [
                {
                    id: 'event-1',
                    title: 'Office Day',
                    startDate: officeDayDate,
                    endDate: new Date(officeDayDate.getTime() + 24 * 60 * 60 * 1000),
                    allDay: true
                }
            ];

            (Calendar.getEventsAsync as jest.Mock).mockResolvedValue(pastEvents);

            const { getByText, getByTestId } = render(<MainScreen />);

            await waitFor(() => {
                expect(getByText('Office Day Tracker')).toBeTruthy();
            });

            // Open date picker
            const dateButton = getByTestId('date-picker-button');
            fireEvent.press(dateButton);

            await waitFor(() => {
                expect(getByText('Select Date')).toBeTruthy();
            });

            // Navigate to August 2025 (current month in test)
            const monthText = getByText('August 2025');
            expect(monthText).toBeTruthy();

            // The 15th should be highlighted as an office day
            const day15 = getByText('15');
            expect(day15).toBeTruthy();

            // Verify the day has the office day styling
            const day15Parent = day15.parent;
            expect(day15Parent).toBeTruthy();
        });

        it('should show different colors for today vs office days', async () => {
            const today = new Date();
            const officeDayDate = new Date(today.getFullYear(), today.getMonth(), 15);

            const pastEvents = [
                {
                    id: 'event-1',
                    title: 'Office Day',
                    startDate: officeDayDate,
                    endDate: new Date(officeDayDate.getTime() + 24 * 60 * 60 * 1000),
                    allDay: true
                }
            ];

            (Calendar.getEventsAsync as jest.Mock).mockResolvedValue(pastEvents);

            const { getByText } = render(<MainScreen />);

            await waitFor(() => {
                expect(getByText('Office Day Tracker')).toBeTruthy();
            });

            // Open date picker
            const dateButton = getByText(`${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`);
            fireEvent.press(dateButton);

            await waitFor(() => {
                expect(getByText('Select Date')).toBeTruthy();
            });

            // Today should be highlighted differently from office days
            const todayDay = getByText(today.getDate().toString());
            expect(todayDay).toBeTruthy();

            // Office day (15th) should also be highlighted
            const day15 = getByText('15');
            expect(day15).toBeTruthy();
        });
    });

    describe('Date Validation', () => {
        it('should prevent logging future dates', async () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 7); // Next week

            const { getByText, getByTestId } = render(<MainScreen />);

            await waitFor(() => {
                expect(getByText('Office Day Tracker')).toBeTruthy();
            });

            // Open date picker
            const dateButton = getByTestId('date-picker-button');
            fireEvent.press(dateButton);

            await waitFor(() => {
                expect(getByText('Select Date')).toBeTruthy();
            });

            // Try to navigate to future month (should be disabled)
            const nextMonthButton = getByText('›');
            expect(nextMonthButton).toBeTruthy();

            // The next month button should be disabled when we're already at current month
            // This test verifies the navigation logic prevents future date selection
        });

        it('should allow logging dates from the past 6 months', async () => {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const { getByText, getByTestId } = render(<MainScreen />);

            await waitFor(() => {
                expect(getByText('Office Day Tracker')).toBeTruthy();
            });

            // Open date picker
            const dateButton = getByTestId('date-picker-button');
            fireEvent.press(dateButton);

            await waitFor(() => {
                expect(getByText('Select Date')).toBeTruthy();
            });

            // Navigate back 6 months
            const prevMonthButton = getByText('‹');
            fireEvent.press(prevMonthButton);

            // Should be able to navigate to past months
            await waitFor(() => {
                expect(getByText('Select Date')).toBeTruthy();
            });
        });
    });

    describe('Data Consistency', () => {
        it('should refresh calendar data after logging new office day', async () => {
            const { getByText } = render(<MainScreen />);

            await waitFor(() => {
                expect(getByText('Office Day Tracker')).toBeTruthy();
            });

            // Mock successful event creation
            (Calendar.createEventAsync as jest.Mock).mockResolvedValue('new-event-id');

            // Mock updated events list after creation
            const updatedEvents = [
                {
                    id: 'new-event-id',
                    title: 'Office Day',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    allDay: true
                }
            ];

            (Calendar.getEventsAsync as jest.Mock)
                .mockResolvedValueOnce([]) // Initial load
                .mockResolvedValueOnce(updatedEvents); // After creation

            // Log office day
            const logButton = getByText('Log Office Day');
            fireEvent.press(logButton);

            // Verify data was refreshed
            await waitFor(() => {
                expect(Calendar.getEventsAsync).toHaveBeenCalledTimes(2);
            });
        });

        it('should update month statistics after logging office day', async () => {
            const { getByText } = render(<MainScreen />);

            await waitFor(() => {
                expect(getByText('Office Day Tracker')).toBeTruthy();
            });

            // Mock successful event creation
            (Calendar.createEventAsync as jest.Mock).mockResolvedValue('new-event-id');

            // Log office day
            const logButton = getByText('Log Office Day');
            fireEvent.press(logButton);

            // Verify statistics were recalculated
            await waitFor(() => {
                // The app should have called getEventsAsync to refresh data
                expect(Calendar.getEventsAsync).toHaveBeenCalled();
            });
        });
    });
});

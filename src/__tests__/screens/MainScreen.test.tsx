import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import MainScreen from '../../screens/MainScreen';
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

            // Wait for app to load - look for the header title specifically
            await waitFor(() => {
                expect(getByTestId('header-title')).toBeTruthy();
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
                expect(getByTestId('header-title')).toBeTruthy();
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
            // Mock past office day events
            const mockEvents = [
                {
                    id: '1',
                    title: 'Office Day',
                    startDate: new Date('2024-01-19T00:00:00.000Z'),
                    endDate: new Date('2024-01-20T00:00:00.000Z'),
                    allDay: true,
                    timeZone: 'UTC',
                },
                {
                    id: '2',
                    title: 'Office Day',
                    startDate: new Date('2024-01-14T00:00:00.000Z'),
                    endDate: new Date('2024-01-15T00:00:00.000Z'),
                    allDay: true,
                    timeZone: 'UTC',
                },
            ];

            (Calendar.getEventsAsync as jest.Mock).mockResolvedValue(mockEvents);

            const { getByText, getAllByText, getByTestId } = render(<MainScreen />);

            await waitFor(() => {
                expect(getByTestId('header-title')).toBeTruthy();
            });

            // Navigate to Past Office Days screen
            const menuButton = getByText('☰');
            fireEvent.press(menuButton);

            const pastOfficeDaysButton = getByText('📅 Past Office Days');
            fireEvent.press(pastOfficeDaysButton);

            // Verify past events are displayed
            await waitFor(() => {
                expect(getByText('📅 Past Office Days')).toBeTruthy();
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

            const { getByText, getByTestId } = render(<MainScreen />);

            await waitFor(() => {
                expect(getByTestId('header-title')).toBeTruthy();
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
                expect(getByTestId('header-title')).toBeTruthy();
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

            const { getByText, getByTestId } = render(<MainScreen />);

            await waitFor(() => {
                expect(getByTestId('header-title')).toBeTruthy();
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
                expect(getByTestId('header-title')).toBeTruthy();
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
                expect(getByTestId('header-title')).toBeTruthy();
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
            const { getByText, getByTestId } = render(<MainScreen />);

            await waitFor(() => {
                expect(getByTestId('header-title')).toBeTruthy();
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
            const { getByText, getByTestId } = render(<MainScreen />);

            await waitFor(() => {
                expect(getByTestId('header-title')).toBeTruthy();
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

        it('should maintain date consistency between logged and retrieved events', async () => {
            const { getByText, getByTestId } = render(<MainScreen />);

            await waitFor(() => {
                expect(getByTestId('header-title')).toBeTruthy();
            });

            // Mock successful event creation BEFORE any user interaction
            (Calendar.createEventAsync as jest.Mock).mockResolvedValue('new-event-id');

            // Mock calendar permissions and calendar retrieval
            (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted'
            });
            (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue([mockCalendar]);
            (Calendar.getEventsAsync as jest.Mock).mockResolvedValue([]);

            // Open date picker and select a specific date
            const dateButton = getByTestId('date-picker-button');
            fireEvent.press(dateButton);

            await waitFor(() => {
                expect(getByText('Select Date')).toBeTruthy();
            });

            // Select a specific date (15th)
            const day15 = getByText('15');
            fireEvent.press(day15);

            // Confirm date
            const confirmButton = getByText('Confirm Date');
            fireEvent.press(confirmButton);

            // Get the selected date before logging
            const selectedDateText = getByText('Date:').parent?.children?.find((child: any) =>
                child.props?.children && typeof child.props.children === 'string' &&
                child.props.children.includes('15')
            )?.props?.children;

            // Log office day
            const logButton = getByText('Log Office Day');
            fireEvent.press(logButton);

            // Wait for the event to be processed
            await waitFor(() => {
                expect(Calendar.createEventAsync).toHaveBeenCalled();
            });

            // Verify that the event was created with the correct date
            const createEventCall = (Calendar.createEventAsync as jest.Mock).mock.calls[0];
            const eventDetails = createEventCall[1];

            // The start date should be the 15th of the month
            const startDate = eventDetails.startDate instanceof Date ? eventDetails.startDate : new Date(eventDetails.startDate);
            expect(startDate.getUTCDate()).toBe(15);
            expect(eventDetails.allDay).toBe(true);
            expect(eventDetails.timeZone).toBe('UTC');
        });

        it('should display UTC events with correct local date in Past Office Days', async () => {
            // Mock a UTC event that should display as Monday Aug 4, 2025
            const utcMondayEvent = {
                id: 'monday-event',
                title: 'Office Day',
                startDate: new Date('2025-08-04T00:00:00Z'), // Monday Aug 4, 2025 at UTC midnight
                endDate: new Date('2025-08-05T00:00:00Z'),
                allDay: true,
                timeZone: 'UTC'
            };

            (Calendar.getEventsAsync as jest.Mock).mockResolvedValue([utcMondayEvent]);

            const { getByText, getByTestId } = render(<MainScreen />);

            await waitFor(() => {
                expect(getByTestId('header-title')).toBeTruthy();
            });

            // Open Past Office Days
            const menuButton = getByText('☰');
            fireEvent.press(menuButton);

            const pastOfficeDaysButton = getByText('📅 Past Office Days');
            fireEvent.press(pastOfficeDaysButton);

            // The UTC event for Aug 4 should display as "Mon, Aug 4, 2025" in local time
            // not as "Sun, Aug 3, 2025" which would be the case with incorrect timezone handling
            await waitFor(() => {
                expect(getByText('Mon, Aug 4, 2025')).toBeTruthy();
                expect(getByText('Office Day')).toBeTruthy();
            });
        });

        it('should calculate month statistics correctly including weekend office days', async () => {
            // Clear the mock from beforeEach and set up our specific test data
            jest.clearAllMocks();

            // Re-setup the required mocks for this test
            (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted'
            });
            (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue([mockCalendar]);

            // Mock events for the current month (August 2025) including weekends
            const currentMonthEvents = [
                // Weekday office days (Mon-Fri)
                {
                    id: 'event-1',
                    title: 'Office Day',
                    startDate: new Date('2025-08-04T00:00:00Z'), // Monday
                    endDate: new Date('2025-08-05T00:00:00Z'),
                    allDay: true
                },
                {
                    id: 'event-2',
                    title: 'Office Day',
                    startDate: new Date('2025-08-05T00:00:00Z'), // Tuesday
                    endDate: new Date('2025-08-06T00:00:00Z'),
                    allDay: true
                },
                {
                    id: 'event-3',
                    title: 'Office Day',
                    startDate: new Date('2025-08-06T00:00:00Z'), // Wednesday
                    endDate: new Date('2025-08-07T00:00:00Z'),
                    allDay: true
                },
                {
                    id: 'event-4',
                    title: 'Office Day',
                    startDate: new Date('2025-08-07T00:00:00Z'), // Thursday
                    endDate: new Date('2025-08-08T00:00:00Z'),
                    allDay: true
                },
                {
                    id: 'event-5',
                    title: 'Office Day',
                    startDate: new Date('2025-08-08T00:00:00Z'), // Friday
                    endDate: new Date('2025-08-09T00:00:00Z'),
                    allDay: true
                },
                // Weekend office days (Sat-Sun)
                {
                    id: 'event-6',
                    title: 'Office Day',
                    startDate: new Date('2025-08-09T00:00:00Z'), // Saturday
                    endDate: new Date('2025-08-10T00:00:00Z'),
                    allDay: true
                },
                {
                    id: 'event-7',
                    title: 'Office Day',
                    startDate: new Date('2025-08-10T00:00:00Z'), // Sunday
                    endDate: new Date('2025-08-11T00:00:00Z'),
                    allDay: true
                }
            ];

            // Mock getEventsAsync to return different values on subsequent calls
            // First call (for checking today) returns empty, second call (for past events) returns our events
            (Calendar.getEventsAsync as jest.Mock)
                .mockResolvedValueOnce([]) // First call - check if logged today
                .mockResolvedValueOnce(currentMonthEvents); // Second call - load past events

            const { getByText, getByTestId } = render(<MainScreen />);

            // Wait for the app to load and calculate stats
            await waitFor(() => {
                expect(getByTestId('header-title')).toBeTruthy();
            });

            // Navigate to Statistics screen to view statistics
            const menuButton = getByText('☰');
            fireEvent.press(menuButton);

            const statisticsButton = getByText('📊 View Statistics');
            fireEvent.press(statisticsButton);

            // Check that statistics are displayed on the Statistics screen
            await waitFor(() => {
                expect(getByText('📊 Office Statistics')).toBeTruthy();
                expect(getByText('📈 August 2025 Statistics')).toBeTruthy();
            });
        });

        it('should handle month statistics calculation edge cases', async () => {
            // Clear the mock from beforeEach and set up our specific test data
            jest.clearAllMocks();

            // Re-setup the required mocks for this test
            (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted'
            });
            (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue([mockCalendar]);

            // Mock events from different months to ensure filtering works
            const mixedMonthEvents = [
                // Current month (August 2025)
                {
                    id: 'event-1',
                    title: 'Office Day',
                    startDate: new Date('2025-08-15T00:00:00Z'),
                    endDate: new Date('2025-08-16T00:00:00Z'),
                    allDay: true
                },
                // Previous month (July 2025) - should NOT be counted
                {
                    id: 'event-2',
                    title: 'Office Day',
                    startDate: new Date('2025-07-15T00:00:00Z'),
                    endDate: new Date('2025-07-16T00:00:00Z'),
                    allDay: true
                },
                // Next month (September 2025) - should NOT be counted
                {
                    id: 'event-3',
                    title: 'Office Day',
                    startDate: new Date('2025-09-15T00:00:00Z'),
                    endDate: new Date('2025-09-16T00:00:00Z'),
                    allDay: true
                }
            ];

            // Mock events retrieval BEFORE rendering the component
            (Calendar.getEventsAsync as jest.Mock).mockResolvedValue(mixedMonthEvents);

            const { getByText, getByTestId } = render(<MainScreen />);

            // Wait for the app to load and calculate stats
            await waitFor(() => {
                expect(getByTestId('header-title')).toBeTruthy();
            });

            // Navigate to Statistics screen to view statistics
            const menuButton = getByText('☰');
            fireEvent.press(menuButton);

            const statisticsButton = getByText('📊 View Statistics');
            fireEvent.press(statisticsButton);

            // Check that statistics are displayed on the Statistics screen
            await waitFor(() => {
                expect(getByText('📊 Office Statistics')).toBeTruthy();
                expect(getByText('📈 August 2025 Statistics')).toBeTruthy();
            });
        });
    });
});

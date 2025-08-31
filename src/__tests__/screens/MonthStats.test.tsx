import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import MainScreen from '../../screens/MainScreen';
import * as Calendar from 'expo-calendar';

// Mock expo-calendar
jest.mock('expo-calendar');

const mockCalendar = Calendar as jest.Mocked<typeof Calendar>;

describe('Month Statistics', () => {
    beforeEach(() => {
        // Mock calendar permissions
        mockCalendar.requestCalendarPermissionsAsync.mockResolvedValue({
            status: 'granted',
            granted: true,
            canAskAgain: true,
            expires: 'never',
        });

        // Mock getCalendarsAsync
        mockCalendar.getCalendarsAsync.mockResolvedValue([
            {
                id: 'test-calendar-id',
                name: 'Test Calendar',
                color: '#000000',
                entityType: Calendar.EntityTypes.EVENT,
                sourceId: 'test-source',
                source: { name: 'Test Source', type: 'test' },
                isPrimary: true,
                isLocalAccount: true,
                isVisible: true,
                isSynced: true,
                accessLevel: Calendar.CalendarAccessLevel.OWNER,
                ownerAccount: 'test@example.com',
                timeZone: 'UTC',
                allowedReminders: [],
                allowedAttendeeTypes: [],
                isImmutable: false,
            },
        ]);

        // Mock getEventsAsync to return no events initially
        mockCalendar.getEventsAsync.mockResolvedValue([]);
    });

    it('should count all office days including weekends in month statistics', async () => {
        // Mock events for August 2025
        const mockEvents = [
            {
                id: '1',
                title: 'Office Day',
                startDate: new Date('2025-08-01T00:00:00.000Z'),
                endDate: new Date('2025-08-02T00:00:00.000Z'),
                allDay: true,
                timeZone: 'UTC',
            },
            {
                id: '2',
                title: 'Office Day',
                startDate: new Date('2025-08-03T00:00:00.000Z'), // Sunday
                endDate: new Date('2025-08-04T00:00:00.000Z'),
                allDay: true,
                timeZone: 'UTC',
            },
            {
                id: '3',
                title: 'Office Day',
                startDate: new Date('2025-08-05T00:00:00.000Z'), // Tuesday
                endDate: new Date('2025-08-06T00:00:00.000Z'),
                allDay: true,
                timeZone: 'UTC',
            },
        ];

        // Mock getEventsAsync to return our test events
        mockCalendar.getEventsAsync.mockResolvedValue(mockEvents);

        const { getByText, getByTestId } = render(<MainScreen />);

        // Wait for the app to load
        await waitFor(() => {
            expect(getByTestId('header-title')).toBeTruthy();
        });

        // Open the date picker to trigger data loading
        const dateButton = getByTestId('date-picker-button');
        fireEvent.press(dateButton);

        // Wait for the date picker to open
        await waitFor(() => {
            expect(getByText('Select Date')).toBeTruthy();
        });

        // Navigate to the statistics screen
        const menuButton = getByText('☰');
        fireEvent.press(menuButton);

        // Click on View Statistics
        const statisticsButton = getByText('📊 View Statistics');
        fireEvent.press(statisticsButton);

        // Now check the statistics on the statistics screen
        await waitFor(() => {
            expect(getByText('📊 Office Statistics')).toBeTruthy();
            expect(getByText('📈 August 2025 Statistics')).toBeTruthy();
        });

        // Check that the statistics show the correct values
        await waitFor(() => {
            expect(getByText('3')).toBeTruthy(); // Office days count
        });
    });

    it('should only count office days from current month in statistics', async () => {
        // Mock events from different months
        const mockEvents = [
            {
                id: '1',
                title: 'Office Day',
                startDate: new Date('2025-08-01T00:00:00.000Z'), // August
                endDate: new Date('2025-08-02T00:00:00.000Z'),
                allDay: true,
                timeZone: 'UTC',
            },
            {
                id: '2',
                title: 'Office Day',
                startDate: new Date('2025-07-15T00:00:00.000Z'), // July
                endDate: new Date('2025-07-16T00:00:00.000Z'),
                allDay: true,
                timeZone: 'UTC',
            },
            {
                id: '3',
                title: 'Office Day',
                startDate: new Date('2025-09-10T00:00:00.000Z'), // September
                endDate: new Date('2025-09-11T00:00:00.000Z'),
                allDay: true,
                timeZone: 'UTC',
            },
        ];

        // Mock getEventsAsync to return our test events
        mockCalendar.getEventsAsync.mockResolvedValue(mockEvents);

        const { getByText, getByTestId } = render(<MainScreen />);

        // Wait for the app to load
        await waitFor(() => {
            expect(getByTestId('header-title')).toBeTruthy();
        });

        // Open the date picker to trigger data loading
        const dateButton = getByTestId('date-picker-button');
        fireEvent.press(dateButton);

        // Wait for the date picker to open
        await waitFor(() => {
            expect(getByText('Select Date')).toBeTruthy();
        });

        // Navigate to the statistics screen
        const menuButton = getByText('☰');
        fireEvent.press(menuButton);

        // Click on View Statistics
        const statisticsButton = getByText('📊 View Statistics');
        fireEvent.press(statisticsButton);

        // Now check the statistics on the statistics screen
        await waitFor(() => {
            expect(getByText('📊 Office Statistics')).toBeTruthy();
            expect(getByText('📈 August 2025 Statistics')).toBeTruthy();
        });

        // Check that only August office days are counted
        await waitFor(() => {
            expect(getByText('1')).toBeTruthy(); // Only August office days count
        });
    });
});

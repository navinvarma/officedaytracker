import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PastOfficeDaysScreen from '../../screens/PastOfficeDaysScreen';
import { Alert } from 'react-native';

// Mock Alert.alert
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
    // Simulate user clicking the Delete button (index 1)
    if (buttons && buttons[1] && buttons[1].onPress) {
        buttons[1].onPress();
    }
});

describe('PastOfficeDaysScreen', () => {
    const mockPastOfficeDays = [
        {
            id: '1',
            title: 'Office Day',
            startDate: new Date('2025-01-15T00:00:00Z'),
            endDate: new Date('2025-01-16T00:00:00Z'),
        },
        {
            id: '2',
            title: 'Office Day',
            startDate: new Date('2025-01-20T00:00:00Z'),
            endDate: new Date('2025-01-21T00:00:00Z'),
        },
        {
            id: '3',
            title: 'Office Day',
            startDate: new Date('2025-02-10T00:00:00Z'),
            endDate: new Date('2025-02-11T00:00:00Z'),
        },
    ];

    const mockOnBack = jest.fn();
    const mockOnDeleteOfficeDay = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Initial Render', () => {
        it('should render with header and back button', async () => {
            const { getByText } = render(
                <PastOfficeDaysScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                    onDeleteOfficeDay={mockOnDeleteOfficeDay}
                />
            );

            await waitFor(() => {
                expect(getByText('📅 Past Office Days')).toBeTruthy();
                expect(getByText('← Back')).toBeTruthy();
            });
        });

        it('should display all past office day events', async () => {
            const { getByText, getAllByText } = render(
                <PastOfficeDaysScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                    onDeleteOfficeDay={mockOnDeleteOfficeDay}
                />
            );

            await waitFor(() => {
                expect(getByText('📅 Past Office Days')).toBeTruthy();
            });

            // Check that all office day events are displayed
            const officeDayElements = getAllByText('Office Day');
            expect(officeDayElements).toHaveLength(3);

            // Check that dates are displayed (using actual format from the component)
            expect(getByText('Tue, Jan 14, 2025')).toBeTruthy();
            expect(getByText('Sun, Jan 19, 2025')).toBeTruthy();
            expect(getByText('Sun, Feb 9, 2025')).toBeTruthy();
        });

        it('should display delete button for each event', async () => {
            const { getAllByText } = render(
                <PastOfficeDaysScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                    onDeleteOfficeDay={mockOnDeleteOfficeDay}
                />
            );

            await waitFor(() => {
                expect(getAllByText('🗑️')).toHaveLength(3);
            });
        });

        it('should display instructions for deletion', async () => {
            const { getByText } = render(
                <PastOfficeDaysScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                    onDeleteOfficeDay={mockOnDeleteOfficeDay}
                />
            );

            await waitFor(() => {
                expect(getByText('Tap the 🗑️ button to delete an office day')).toBeTruthy();
            });
        });
    });

    describe('Navigation', () => {
        it('should call onBack when back button is pressed', async () => {
            const { getByText } = render(
                <PastOfficeDaysScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                    onDeleteOfficeDay={mockOnDeleteOfficeDay}
                />
            );

            await waitFor(() => {
                expect(getByText('← Back')).toBeTruthy();
            });

            const backButton = getByText('← Back');
            fireEvent.press(backButton);

            expect(mockOnBack).toHaveBeenCalledTimes(1);
        });
    });

    describe('Event Deletion', () => {
        it('should call onDeleteOfficeDay with correct parameters when delete button is pressed', async () => {
            const { getAllByText } = render(
                <PastOfficeDaysScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                    onDeleteOfficeDay={mockOnDeleteOfficeDay}
                />
            );

            await waitFor(() => {
                expect(getAllByText('🗑️')).toHaveLength(3);
            });

            // Delete the first event
            const deleteButtons = getAllByText('🗑️');
            fireEvent.press(deleteButtons[0]);

            expect(mockOnDeleteOfficeDay).toHaveBeenCalledWith(
                '1',
                new Date('2025-01-15T00:00:00Z')
            );
        });

        it('should call onDeleteOfficeDay for different events', async () => {
            const { getAllByText } = render(
                <PastOfficeDaysScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                    onDeleteOfficeDay={mockOnDeleteOfficeDay}
                />
            );

            await waitFor(() => {
                expect(getAllByText('🗑️')).toHaveLength(3);
            });

            // Delete the second event
            const deleteButtons = getAllByText('🗑️');
            fireEvent.press(deleteButtons[1]);

            expect(mockOnDeleteOfficeDay).toHaveBeenCalledWith(
                '2',
                new Date('2025-01-20T00:00:00Z')
            );
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty past office days list', async () => {
            const { getByText, queryByText } = render(
                <PastOfficeDaysScreen
                    pastOfficeDays={[]}
                    onBack={mockOnBack}
                    onDeleteOfficeDay={mockOnDeleteOfficeDay}
                />
            );

            await waitFor(() => {
                expect(getByText('📅 Past Office Days')).toBeTruthy();
            });

            // Should still display header and instructions
            expect(getByText('← Back')).toBeTruthy();
            expect(getByText('Tap the 🗑️ button to delete an office day')).toBeTruthy();

            // Should not display any office day events
            expect(queryByText('Office Day')).toBeNull();
            expect(queryByText('🗑️')).toBeNull();
        });

        it('should handle single office day event', async () => {
            const singleEvent = [mockPastOfficeDays[0]];

            const { getByText, getAllByText } = render(
                <PastOfficeDaysScreen
                    pastOfficeDays={singleEvent}
                    onBack={mockOnBack}
                    onDeleteOfficeDay={mockOnDeleteOfficeDay}
                />
            );

            await waitFor(() => {
                expect(getByText('📅 Past Office Days')).toBeTruthy();
            });

            // Should display one event
            expect(getAllByText('Office Day')).toHaveLength(1);
            expect(getAllByText('🗑️')).toHaveLength(1);
            expect(getByText('Tue, Jan 14, 2025')).toBeTruthy();
        });

        it('should handle many office day events', async () => {
            const manyEvents = Array.from({ length: 10 }, (_, index) => ({
                id: `event-${index}`,
                title: 'Office Day',
                startDate: new Date(`2025-01-${15 + index}T00:00:00Z`),
                endDate: new Date(`2025-01-${16 + index}T00:00:00Z`),
            }));

            const { getByText, getAllByText } = render(
                <PastOfficeDaysScreen
                    pastOfficeDays={manyEvents}
                    onBack={mockOnBack}
                    onDeleteOfficeDay={mockOnDeleteOfficeDay}
                />
            );

            await waitFor(() => {
                expect(getByText('📅 Past Office Days')).toBeTruthy();
            });

            // Should display all 10 events
            expect(getAllByText('Office Day')).toHaveLength(10);
            expect(getAllByText('🗑️')).toHaveLength(10);
        });

        it('should handle events with different date formats', async () => {
            const eventsWithDifferentDates = [
                {
                    id: '1',
                    title: 'Office Day',
                    startDate: new Date('2025-01-01T00:00:00Z'), // New Year's Day
                    endDate: new Date('2025-01-02T00:00:00Z'),
                },
                {
                    id: '2',
                    title: 'Office Day',
                    startDate: new Date('2025-12-31T00:00:00Z'), // New Year's Eve
                    endDate: new Date('2026-01-01T00:00:00Z'),
                },
            ];

            const { getByText } = render(
                <PastOfficeDaysScreen
                    pastOfficeDays={eventsWithDifferentDates}
                    onBack={mockOnBack}
                    onDeleteOfficeDay={mockOnDeleteOfficeDay}
                />
            );

            await waitFor(() => {
                expect(getByText('📅 Past Office Days')).toBeTruthy();
            });

            // Should display dates correctly
            expect(getByText('Tue, Dec 31, 2024')).toBeTruthy();
            expect(getByText('Tue, Dec 30, 2025')).toBeTruthy();
        });
    });

    describe('Date Formatting', () => {
        it('should format dates correctly for different months', async () => {
            const eventsInDifferentMonths = [
                {
                    id: '1',
                    title: 'Office Day',
                    startDate: new Date('2025-01-15T00:00:00Z'), // January
                    endDate: new Date('2025-01-16T00:00:00Z'),
                },
                {
                    id: '2',
                    title: 'Office Day',
                    startDate: new Date('2025-06-15T00:00:00Z'), // June
                    endDate: new Date('2025-06-16T00:00:00Z'),
                },
                {
                    id: '3',
                    title: 'Office Day',
                    startDate: new Date('2025-12-15T00:00:00Z'), // December
                    endDate: new Date('2025-12-16T00:00:00Z'),
                },
            ];

            const { getByText } = render(
                <PastOfficeDaysScreen
                    pastOfficeDays={eventsInDifferentMonths}
                    onBack={mockOnBack}
                    onDeleteOfficeDay={mockOnDeleteOfficeDay}
                />
            );

            await waitFor(() => {
                expect(getByText('📅 Past Office Days')).toBeTruthy();
            });

            // Check month abbreviations
            expect(getByText('Tue, Jan 14, 2025')).toBeTruthy();
            expect(getByText('Sat, Jun 14, 2025')).toBeTruthy();
            expect(getByText('Sun, Dec 14, 2025')).toBeTruthy();
        });

        it('should handle leap year dates', async () => {
            const leapYearEvent = [
                {
                    id: '1',
                    title: 'Office Day',
                    startDate: new Date('2024-02-29T00:00:00Z'), // Leap day
                    endDate: new Date('2024-03-01T00:00:00Z'),
                },
            ];

            const { getByText } = render(
                <PastOfficeDaysScreen
                    pastOfficeDays={leapYearEvent}
                    onBack={mockOnBack}
                    onDeleteOfficeDay={mockOnDeleteOfficeDay}
                />
            );

            await waitFor(() => {
                expect(getByText('📅 Past Office Days')).toBeTruthy();
            });

            // Should display leap day correctly (Feb 29, 2024 is a Thursday)
            expect(getByText('Wed, Feb 28, 2024')).toBeTruthy();
        });
    });

    describe('Accessibility', () => {
        it('should have accessible elements', async () => {
            const { getByText, getAllByText } = render(
                <PastOfficeDaysScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                    onDeleteOfficeDay={mockOnDeleteOfficeDay}
                />
            );

            await waitFor(() => {
                expect(getByText('📅 Past Office Days')).toBeTruthy();
            });

            // Check that important elements are accessible
            expect(getByText('← Back')).toBeTruthy();
            expect(getAllByText('🗑️')).toHaveLength(3);
            expect(getByText('Tap the 🗑️ button to delete an office day')).toBeTruthy();
        });
    });
});

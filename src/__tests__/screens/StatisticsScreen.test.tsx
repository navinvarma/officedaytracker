import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import StatisticsScreen from '../../screens/StatisticsScreen';
import { StatisticsService } from '../../services/StatisticsService';

// Mock StatisticsService
jest.mock('../../services/StatisticsService', () => ({
    StatisticsService: {
        getQuarterConfig: jest.fn(),
        getAvailableYears: jest.fn(),
        getAvailableMonths: jest.fn(),
        calculateMonthStats: jest.fn(),
        calculateQuarterStats: jest.fn(),
        calculateYearStats: jest.fn(),
        setQuarterConfig: jest.fn(),
        getMonthName: jest.fn(),
    }
}));

const mockStatisticsService = StatisticsService as jest.Mocked<typeof StatisticsService>;

describe('StatisticsScreen', () => {
    const mockPastOfficeDays = [
        { startDate: new Date('2025-01-15T00:00:00Z') },
        { startDate: new Date('2025-01-20T00:00:00Z') },
        { startDate: new Date('2025-02-10T00:00:00Z') },
        { startDate: new Date('2025-03-05T00:00:00Z') },
        { startDate: new Date('2025-08-15T00:00:00Z') },
    ];

    const mockQuarterConfig = {
        Q1: [0, 1, 2], // Jan, Feb, Mar
        Q2: [3, 4, 5], // Apr, May, Jun
        Q3: [6, 7, 8], // Jul, Aug, Sep
        Q4: [9, 10, 11], // Oct, Nov, Dec
    };

    const mockPeriodStats = {
        workingDays: 22,
        officeDays: 5,
        percentage: 22.73,
        period: 'August 2025'
    };

    const mockOnBack = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default mocks
        mockStatisticsService.getQuarterConfig.mockReturnValue(mockQuarterConfig);
        mockStatisticsService.getAvailableYears.mockReturnValue([2025, 2024]);
        mockStatisticsService.getAvailableMonths.mockReturnValue([0, 1, 2, 7]); // Jan, Feb, Mar, Aug
        mockStatisticsService.calculateMonthStats.mockReturnValue(mockPeriodStats);
        mockStatisticsService.calculateQuarterStats.mockReturnValue(mockPeriodStats);
        mockStatisticsService.calculateYearStats.mockReturnValue(mockPeriodStats);
        mockStatisticsService.getMonthName.mockImplementation((monthIndex: number) => {
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            return monthNames[monthIndex];
        });
    });

    describe('Initial Render', () => {
        it('should render with default state', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                />
            );

            await waitFor(() => {
                expect(getByText('📊 Office Statistics')).toBeTruthy();
                expect(getByText('Select Period Type:')).toBeTruthy();
                expect(getByText('Month')).toBeTruthy();
                expect(getByText('Quarter')).toBeTruthy();
                expect(getByText('Year')).toBeTruthy();
            });
        });

        it('should display current statistics', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                />
            );

            await waitFor(() => {
                expect(getByText('📈 August 2025 Statistics')).toBeTruthy();
                expect(getByText('22')).toBeTruthy(); // Working days
                expect(getByText('5')).toBeTruthy(); // Office days
                expect(getByText('22.73%')).toBeTruthy(); // Percentage
            });
        });
    });

    describe('Period Type Selection', () => {
        it('should switch between month, quarter, and year views', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                />
            );

            await waitFor(() => {
                expect(getByText('Month')).toBeTruthy();
            });

            // Switch to Quarter view
            const quarterButton = getByText('Quarter');
            fireEvent.press(quarterButton);

            await waitFor(() => {
                expect(mockStatisticsService.calculateQuarterStats).toHaveBeenCalled();
            });

            // Switch to Year view
            const yearButton = getByText('Year');
            fireEvent.press(yearButton);

            await waitFor(() => {
                expect(mockStatisticsService.calculateYearStats).toHaveBeenCalled();
            });
        });

        it('should update statistics when period type changes', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                />
            );

            await waitFor(() => {
                expect(getByText('Month')).toBeTruthy();
            });

            // Switch to Quarter view
            const quarterButton = getByText('Quarter');
            fireEvent.press(quarterButton);

            await waitFor(() => {
                expect(mockStatisticsService.calculateQuarterStats).toHaveBeenCalledWith(
                    2025, 'Q1', expect.any(Array)
                );
            });
        });
    });

    describe('Year Selection', () => {
        it('should display available years in dropdown', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                />
            );

            await waitFor(() => {
                expect(getByText('2025')).toBeTruthy();
            });
        });

        it('should update statistics when year changes', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                />
            );

            await waitFor(() => {
                expect(getByText('2025')).toBeTruthy();
            });

            // Change year (this would typically be done through a picker)
            // For now, we'll test the handler function directly
            const yearButton = getByText('2025');
            fireEvent.press(yearButton);

            // The handler should be called and statistics updated
            await waitFor(() => {
                expect(mockStatisticsService.getAvailableMonths).toHaveBeenCalled();
            });
        });
    });

    describe('Month Selection', () => {
        it('should display available months for selected year', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                />
            );

            await waitFor(() => {
                expect(getByText('January')).toBeTruthy();
                expect(getByText('February')).toBeTruthy();
                expect(getByText('March')).toBeTruthy();
                expect(getByText('August')).toBeTruthy();
            });
        });

        it('should update statistics when month changes', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                />
            );

            await waitFor(() => {
                expect(getByText('January')).toBeTruthy();
            });

            // Change month
            const februaryButton = getByText('February');
            fireEvent.press(februaryButton);

            await waitFor(() => {
                expect(mockStatisticsService.calculateMonthStats).toHaveBeenCalledWith(
                    2025, 1, expect.any(Array) // February is month 1 (0-indexed)
                );
            });
        });
    });

    describe('Quarter Selection', () => {
        it('should display quarter options when quarter view is selected', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                />
            );

            // Switch to Quarter view first
            const quarterButton = getByText('Quarter');
            fireEvent.press(quarterButton);

            await waitFor(() => {
                expect(getByText('Q1:')).toBeTruthy();
                expect(getByText('Q2:')).toBeTruthy();
                expect(getByText('Q3:')).toBeTruthy();
                expect(getByText('Q4:')).toBeTruthy();
            });
        });

        it('should update statistics when quarter changes', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                />
            );

            // Switch to Quarter view first
            const quarterButton = getByText('Quarter');
            fireEvent.press(quarterButton);

            await waitFor(() => {
                expect(getByText('Q2')).toBeTruthy();
            });

            // Change quarter
            const q2Button = getByText('Q2');
            fireEvent.press(q2Button);

            await waitFor(() => {
                expect(mockStatisticsService.calculateQuarterStats).toHaveBeenCalledWith(
                    2025, 'Q2', expect.any(Array)
                );
            });
        });
    });

    describe('Quarter Configuration', () => {
        it('should display quarter configuration section', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                />
            );

            await waitFor(() => {
                expect(getByText('⚙️ Quarter Configuration')).toBeTruthy();
                expect(getByText('Configure which months belong to each quarter')).toBeTruthy();
            });
        });

        it('should display month toggles for each quarter', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                />
            );

            await waitFor(() => {
                expect(getByText('Q1:')).toBeTruthy();
                expect(getByText('Q2:')).toBeTruthy();
                expect(getByText('Q3:')).toBeTruthy();
                expect(getByText('Q4:')).toBeTruthy();
            });
        });

        it('should save quarter configuration', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                />
            );

            await waitFor(() => {
                expect(getByText('💾 Save Configuration')).toBeTruthy();
            });

            const saveButton = getByText('💾 Save Configuration');
            fireEvent.press(saveButton);

            expect(mockStatisticsService.setQuarterConfig).toHaveBeenCalledWith(mockQuarterConfig);
        });

        it('should reset quarter configuration', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                />
            );

            await waitFor(() => {
                expect(getByText('🔄 Reset to Default')).toBeTruthy();
            });

            const resetButton = getByText('🔄 Reset to Default');
            fireEvent.press(resetButton);

            // Should reset to default configuration
            expect(mockStatisticsService.getQuarterConfig).toHaveBeenCalled();
        });
    });

    describe('Navigation', () => {
        it('should call onBack when back button is pressed', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                />
            );

            await waitFor(() => {
                expect(getByText('← Back')).toBeTruthy();
            });

            const backButton = getByText('← Back');
            fireEvent.press(backButton);

            expect(mockOnBack).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty past office days', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={[]}
                    onBack={mockOnBack}
                />
            );

            await waitFor(() => {
                expect(getByText('📊 Office Statistics')).toBeTruthy();
            });

            // Should still display the interface even with no data
            expect(getByText('📊 Office Statistics')).toBeTruthy();
        });

        it('should handle single office day', async () => {
            const singleOfficeDay = [{ startDate: new Date('2025-01-15T00:00:00Z') }];

            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={singleOfficeDay}
                    onBack={mockOnBack}
                />
            );

            await waitFor(() => {
                expect(getByText('📊 Office Statistics')).toBeTruthy();
            });

            // Should display statistics for the single day
            expect(getByText('📊 Office Statistics')).toBeTruthy();
        });

        it('should handle multiple years of data', async () => {
            const multiYearData = [
                { startDate: new Date('2024-01-15T00:00:00Z') },
                { startDate: new Date('2025-01-15T00:00:00Z') },
                { startDate: new Date('2026-01-15T00:00:00Z') },
            ];

            mockStatisticsService.getAvailableYears.mockReturnValue([2026, 2025, 2024]);

            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={multiYearData}
                    onBack={mockOnBack}
                />
            );

            await waitFor(() => {
                expect(getByText('📊 Office Statistics')).toBeTruthy();
            });

            // Should display multiple years
            expect(getByText('2026')).toBeTruthy();
        });
    });

    describe('Statistics Calculation', () => {
        it('should calculate month statistics correctly', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                />
            );

            await waitFor(() => {
                expect(mockStatisticsService.calculateMonthStats).toHaveBeenCalledWith(
                    2025, 7, expect.any(Array) // August is month 7 (0-indexed)
                );
            });
        });

        it('should calculate quarter statistics correctly', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                />
            );

            // Switch to Quarter view
            const quarterButton = getByText('Quarter');
            fireEvent.press(quarterButton);

            await waitFor(() => {
                expect(mockStatisticsService.calculateQuarterStats).toHaveBeenCalledWith(
                    2025, 'Q1', expect.any(Array)
                );
            });
        });

        it('should calculate year statistics correctly', async () => {
            const { getByText } = render(
                <StatisticsScreen
                    pastOfficeDays={mockPastOfficeDays}
                    onBack={mockOnBack}
                />
            );

            // Switch to Year view
            const yearButton = getByText('Year');
            fireEvent.press(yearButton);

            await waitFor(() => {
                expect(mockStatisticsService.calculateYearStats).toHaveBeenCalledWith(
                    2025, expect.any(Array)
                );
            });
        });
    });
});

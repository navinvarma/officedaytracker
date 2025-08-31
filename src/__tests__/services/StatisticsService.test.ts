import { StatisticsService } from '../../services/StatisticsService';

describe('StatisticsService', () => {
    const mockOfficeDays = [
        new Date('2024-01-15'), // Monday
        new Date('2024-01-16'), // Tuesday
        new Date('2024-01-17'), // Wednesday
        new Date('2024-01-22'), // Monday
        new Date('2024-01-23'), // Tuesday
        new Date('2024-02-05'), // Monday
        new Date('2024-02-06'), // Tuesday
        new Date('2024-03-04'), // Monday
        new Date('2024-04-01'), // Monday
        new Date('2024-04-02'), // Tuesday
    ];

    // Reset to default configuration before each test
    beforeEach(() => {
        StatisticsService.setQuarterConfig({
            Q1: [0, 1, 2],   // January, February, March
            Q2: [3, 4, 5],   // April, May, June
            Q3: [6, 7, 8],   // July, August, September
            Q4: [9, 10, 11]  // October, November, December
        });
    });

    describe('calculateWorkingDays', () => {
        it('should calculate working days correctly for a week', () => {
            const startDate = new Date('2024-01-15'); // Monday
            const endDate = new Date('2024-01-19'); // Friday

            const workingDays = StatisticsService.calculateWorkingDays(startDate, endDate);
            expect(workingDays).toBe(5);
        });

        it('should calculate working days correctly for a month', () => {
            const startDate = new Date('2024-01-01'); // January 1st
            const endDate = new Date('2024-01-31'); // January 31st

            const workingDays = StatisticsService.calculateWorkingDays(startDate, endDate);
            // January 2024 has 23 working days (excluding weekends)
            expect(workingDays).toBe(23);
        });

        it('should handle single day correctly', () => {
            const startDate = new Date('2024-01-15'); // Monday
            const endDate = new Date('2024-01-15'); // Same Monday

            const workingDays = StatisticsService.calculateWorkingDays(startDate, endDate);
            expect(workingDays).toBe(1);
        });
    });

    describe('calculateMonthStats', () => {
        it('should calculate January 2024 stats correctly', () => {
            const stats = StatisticsService.calculateMonthStats(2024, 0, mockOfficeDays);

            expect(stats.workingDays).toBe(23); // January 2024 has 23 working days
            expect(stats.officeDays).toBe(5); // 5 office days in January from mock data
            expect(stats.percentage).toBe(22); // 5/23 ≈ 22%
            expect(stats.period).toBe('January 2024');
        });

        it('should calculate February 2024 stats correctly', () => {
            const stats = StatisticsService.calculateMonthStats(2024, 1, mockOfficeDays);

            expect(stats.workingDays).toBe(21); // February 2024 has 21 working days
            expect(stats.officeDays).toBe(2); // 2 office days in February from mock data
            expect(stats.percentage).toBe(10); // 2/21 ≈ 10%
            expect(stats.period).toBe('February 2024');
        });

        it('should handle month with no office days', () => {
            const stats = StatisticsService.calculateMonthStats(2024, 5, mockOfficeDays); // June

            expect(stats.workingDays).toBe(20); // June 2024 has 20 working days
            expect(stats.officeDays).toBe(0); // No office days in June
            expect(stats.percentage).toBe(0); // 0%
            expect(stats.period).toBe('June 2024');
        });
    });

    describe('calculateQuarterStats', () => {
        it('should calculate Q1 2024 stats correctly', () => {
            const stats = StatisticsService.calculateQuarterStats(2024, 'Q1', mockOfficeDays);

            // Q1 includes January (23), February (21), March (21) = 65 working days
            expect(stats.workingDays).toBe(65);
            expect(stats.officeDays).toBe(8); // 5 + 2 + 1 = 8 office days in Q1
            expect(stats.percentage).toBe(12); // 8/65 ≈ 12%
            expect(stats.period).toBe('Q1 2024');
        });

        it('should calculate Q2 2024 stats correctly', () => {
            const stats = StatisticsService.calculateQuarterStats(2024, 'Q2', mockOfficeDays);

            // Q2 includes April (22), May (23), June (20) = 65 working days
            expect(stats.workingDays).toBe(65);
            expect(stats.officeDays).toBe(2); // 2 office days in April, 0 in May/June
            expect(stats.percentage).toBe(3); // 2/65 ≈ 3%
            expect(stats.period).toBe('Q2 2024');
        });

        it('should throw error for invalid quarter configuration', () => {
            // Test with a custom quarter config that has an invalid quarter
            const invalidConfig = {
                Q1: [0, 1, 2],
                Q2: [3, 4, 5],
                Q3: [6, 7, 8],
                Q4: [] // Invalid: empty array
            };

            expect(() => {
                StatisticsService.setQuarterConfig(invalidConfig);
                StatisticsService.calculateQuarterStats(2024, 'Q4', mockOfficeDays);
            }).toThrow('Invalid quarter: Q4');

            // Reset to default config
            StatisticsService.setQuarterConfig({
                Q1: [0, 1, 2],
                Q2: [3, 4, 5],
                Q3: [6, 7, 8],
                Q4: [9, 10, 11]
            });
        });

        it('should apply custom quarter configuration correctly', () => {
            // Test with a custom quarter config where Q1 is Feb, Mar, Apr
            const customConfig = {
                Q1: [1, 2, 3],   // February, March, April
                Q2: [4, 5, 6],   // May, June, July
                Q3: [7, 8, 9],   // August, September, October
                Q4: [10, 11, 0]  // November, December, January
            };

            StatisticsService.setQuarterConfig(customConfig);

            // Test Q1 2024 (Feb, Mar, Apr)
            const q1Stats = StatisticsService.calculateQuarterStats(2024, 'Q1', mockOfficeDays);
            expect(q1Stats.workingDays).toBe(64); // Feb(20) + Mar(21) + Apr(22) = 64 working days
            expect(q1Stats.officeDays).toBe(5); // 5 office days in Feb, Mar, Apr
            expect(q1Stats.period).toBe('Q1 2024');

            // Test Q4 2024 (Nov, Dec, Jan 2025)
            const q4Stats = StatisticsService.calculateQuarterStats(2024, 'Q4', mockOfficeDays);
            expect(q4Stats.workingDays).toBe(262); // Nov(21) + Dec(22) + Jan(23) = 262 working days (includes Jan 2025)
            expect(q4Stats.officeDays).toBe(5); // 5 office days in Jan, 0 in Nov/Dec
            expect(q4Stats.period).toBe('Q4 2024');
        });
    });

    describe('calculateYearStats', () => {
        it('should calculate 2024 year stats correctly', () => {
            const stats = StatisticsService.calculateYearStats(2024, mockOfficeDays);

            // 2024 has 262 working days (leap year)
            expect(stats.workingDays).toBe(262);
            expect(stats.officeDays).toBe(10); // Total office days in mock data
            expect(stats.percentage).toBe(4); // 10/262 ≈ 4%
            expect(stats.period).toBe('2024');
        });
    });

    describe('getAvailableYears', () => {
        it('should return unique years sorted in descending order', () => {
            const years = StatisticsService.getAvailableYears(mockOfficeDays);
            expect(years).toEqual([2024]);
        });

        it('should handle empty array', () => {
            const years = StatisticsService.getAvailableYears([]);
            expect(years).toEqual([]);
        });
    });

    describe('getAvailableMonths', () => {
        it('should return months for specific year', () => {
            const months = StatisticsService.getAvailableMonths(2024, mockOfficeDays);
            expect(months).toEqual([0, 1, 2, 3]); // January, February, March, April
        });

        it('should return empty array for year with no office days', () => {
            const months = StatisticsService.getAvailableMonths(2023, mockOfficeDays);
            expect(months).toEqual([]);
        });
    });

    describe('getMonthName', () => {
        it('should return correct month names', () => {
            expect(StatisticsService.getMonthName(0)).toBe('January');
            expect(StatisticsService.getMonthName(1)).toBe('February');
            expect(StatisticsService.getMonthName(11)).toBe('December');
        });
    });

    describe('getQuarterFromMonth', () => {
        it('should return correct quarter for months', () => {
            expect(StatisticsService.getQuarterFromMonth(0)).toBe('Q1'); // January
            expect(StatisticsService.getQuarterFromMonth(1)).toBe('Q1'); // February
            expect(StatisticsService.getQuarterFromMonth(2)).toBe('Q1'); // March
            expect(StatisticsService.getQuarterFromMonth(3)).toBe('Q2'); // April
            expect(StatisticsService.getQuarterFromMonth(6)).toBe('Q3'); // July
            expect(StatisticsService.getQuarterFromMonth(9)).toBe('Q4'); // October
        });
    });

    describe('quarter configuration', () => {
        it('should allow custom quarter configuration', () => {
            const customConfig = {
                Q1: [0, 1, 2],   // Jan, Feb, Mar
                Q2: [3, 4, 5],   // Apr, May, Jun
                Q3: [6, 7, 8],   // Jul, Aug, Sep
                Q4: [9, 10, 11]  // Oct, Nov, Dec
            };

            StatisticsService.setQuarterConfig(customConfig);
            const config = StatisticsService.getQuarterConfig();
            expect(config).toEqual(customConfig);
        });
    });
});

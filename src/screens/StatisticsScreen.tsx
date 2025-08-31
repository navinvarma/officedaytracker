import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import { StatisticsService } from '../services/StatisticsService';
import { PeriodStats, QuarterConfig } from '../types';

interface StatisticsState {
    selectedPeriodType: 'month' | 'quarter' | 'year';
    selectedYear: number;
    selectedMonth: number;
    selectedQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    currentStats: PeriodStats;
    availableYears: number[];
    availableMonths: number[];
}

interface StatisticsScreenProps {
    pastOfficeDays: Array<{ startDate: Date }>;
    onBack: () => void;
}

export default function StatisticsScreen({ pastOfficeDays, onBack }: StatisticsScreenProps) {
    const [statisticsState, setStatisticsState] = useState<StatisticsState>({
        selectedPeriodType: 'month',
        selectedYear: new Date().getFullYear(),
        selectedMonth: new Date().getMonth(),
        selectedQuarter: 'Q1',
        currentStats: { workingDays: 0, officeDays: 0, percentage: 0, period: '' },
        availableYears: [],
        availableMonths: []
    });

    const [quarterConfig, setQuarterConfig] = useState<QuarterConfig>(StatisticsService.getQuarterConfig());

    useEffect(() => {
        updateStatisticsState();
    }, [pastOfficeDays]);

    const updateStatisticsState = () => {
        const officeDayDates = pastOfficeDays.map(event => new Date(event.startDate));
        const availableYears = StatisticsService.getAvailableYears(officeDayDates);

        // Set current year if no years available
        const currentYear = availableYears.length > 0 ? availableYears[0] : new Date().getFullYear();

        // Get available months for current year
        const availableMonths = StatisticsService.getAvailableMonths(currentYear, officeDayDates);

        setStatisticsState(prev => {
            // Calculate current stats based on selected period type
            let currentStats: PeriodStats;

            if (prev.selectedPeriodType === 'month') {
                currentStats = StatisticsService.calculateMonthStats(
                    prev.selectedYear,
                    prev.selectedMonth,
                    officeDayDates
                );
            } else if (prev.selectedPeriodType === 'quarter') {
                currentStats = StatisticsService.calculateQuarterStats(
                    prev.selectedYear,
                    prev.selectedQuarter,
                    officeDayDates
                );
            } else {
                currentStats = StatisticsService.calculateYearStats(prev.selectedYear, officeDayDates);
            }

            return {
                ...prev,
                selectedYear: currentYear,
                availableYears,
                availableMonths,
                currentStats
            };
        });
    };

    const updateStatisticsStateWithQuarter = (quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4') => {
        const officeDayDates = pastOfficeDays.map(event => new Date(event.startDate));
        const availableYears = StatisticsService.getAvailableYears(officeDayDates);

        // Set current year if no years available
        const currentYear = availableYears.length > 0 ? availableYears[0] : new Date().getFullYear();

        // Get available months for current year
        const availableMonths = StatisticsService.getAvailableMonths(currentYear, officeDayDates);

        setStatisticsState(prev => {
            // Calculate current stats based on selected period type
            let currentStats: PeriodStats;

            if (prev.selectedPeriodType === 'month') {
                currentStats = StatisticsService.calculateMonthStats(
                    prev.selectedYear,
                    prev.selectedMonth,
                    officeDayDates
                );
            } else if (prev.selectedPeriodType === 'quarter') {
                currentStats = StatisticsService.calculateQuarterStats(
                    prev.selectedYear,
                    quarter, // Use the passed quarter parameter
                    officeDayDates
                );
            } else {
                currentStats = StatisticsService.calculateYearStats(prev.selectedYear, officeDayDates);
            }

            return {
                ...prev,
                selectedYear: currentYear,
                availableYears,
                availableMonths,
                currentStats
            };
        });
    };

    const updateStatisticsStateWithPeriodType = (periodType: 'month' | 'quarter' | 'year') => {
        const officeDayDates = pastOfficeDays.map(event => new Date(event.startDate));
        const availableYears = StatisticsService.getAvailableYears(officeDayDates);

        // Set current year if no years available
        const currentYear = availableYears.length > 0 ? availableYears[0] : new Date().getFullYear();

        // Get available months for current year
        const availableMonths = StatisticsService.getAvailableMonths(currentYear, officeDayDates);

        setStatisticsState(prev => {
            // Calculate current stats based on selected period type
            let currentStats: PeriodStats;

            if (periodType === 'month') {
                currentStats = StatisticsService.calculateMonthStats(
                    prev.selectedYear,
                    prev.selectedMonth,
                    officeDayDates
                );
            } else if (periodType === 'quarter') {
                currentStats = StatisticsService.calculateQuarterStats(
                    prev.selectedYear,
                    prev.selectedQuarter,
                    officeDayDates
                );
            } else {
                currentStats = StatisticsService.calculateYearStats(prev.selectedYear, officeDayDates);
            }

            return {
                ...prev,
                selectedPeriodType: periodType,
                selectedYear: currentYear,
                availableYears,
                availableMonths,
                currentStats
            };
        });
    };

    const updateStatisticsStateWithYear = (year: number) => {
        const officeDayDates = pastOfficeDays.map(event => new Date(event.startDate));
        const availableYears = StatisticsService.getAvailableYears(officeDayDates);

        // Get available months for the selected year
        const availableMonths = StatisticsService.getAvailableMonths(year, officeDayDates);

        setStatisticsState(prev => {
            // Calculate current stats based on selected period type
            let currentStats: PeriodStats;

            if (prev.selectedPeriodType === 'month') {
                currentStats = StatisticsService.calculateMonthStats(
                    year,
                    prev.selectedMonth,
                    officeDayDates
                );
            } else if (prev.selectedPeriodType === 'quarter') {
                currentStats = StatisticsService.calculateQuarterStats(
                    year,
                    prev.selectedQuarter,
                    officeDayDates
                );
            } else {
                currentStats = StatisticsService.calculateYearStats(year, officeDayDates);
            }

            return {
                ...prev,
                selectedYear: year,
                availableYears,
                availableMonths,
                currentStats
            };
        });
    };

    const updateStatisticsStateWithMonth = (month: number) => {
        const officeDayDates = pastOfficeDays.map(event => new Date(event.startDate));
        const availableYears = StatisticsService.getAvailableYears(officeDayDates);

        // Set current year if no years available
        const currentYear = availableYears.length > 0 ? availableYears[0] : new Date().getFullYear();

        // Get available months for current year
        const availableMonths = StatisticsService.getAvailableMonths(currentYear, officeDayDates);

        setStatisticsState(prev => {
            // Calculate current stats based on selected period type
            let currentStats: PeriodStats;

            if (prev.selectedPeriodType === 'month') {
                currentStats = StatisticsService.calculateMonthStats(
                    prev.selectedYear,
                    month,
                    officeDayDates
                );
            } else if (prev.selectedPeriodType === 'quarter') {
                currentStats = StatisticsService.calculateQuarterStats(
                    prev.selectedYear,
                    prev.selectedQuarter,
                    officeDayDates
                );
            } else {
                currentStats = StatisticsService.calculateYearStats(prev.selectedYear, officeDayDates);
            }

            return {
                ...prev,
                selectedMonth: month,
                selectedYear: currentYear,
                availableYears,
                availableMonths,
                currentStats
            };
        });
    };

    const handlePeriodTypeChange = (periodType: 'month' | 'quarter' | 'year') => {
        setStatisticsState(prev => ({
            ...prev,
            selectedPeriodType: periodType
        }));
        // Update statistics with new period type immediately
        updateStatisticsStateWithPeriodType(periodType);
    };

    const handleYearChange = (year: number) => {
        setStatisticsState(prev => ({
            ...prev,
            selectedYear: year
        }));
        // Update statistics with new year immediately
        updateStatisticsStateWithYear(year);
    };

    const handleMonthChange = (month: number) => {
        setStatisticsState(prev => ({
            ...prev,
            selectedMonth: month
        }));
        // Update statistics with new month immediately
        updateStatisticsStateWithMonth(month);
    };

    const handleQuarterChange = (quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4') => {
        setStatisticsState(prev => ({
            ...prev,
            selectedQuarter: quarter
        }));
        // Update statistics with new quarter immediately
        updateStatisticsStateWithQuarter(quarter);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>📊 Office Statistics</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Enhanced Statistics Section */}
                <View style={styles.statsSection}>
                    {/* Period Type Selection */}
                    <View style={styles.periodTypeContainer}>
                        <Text style={styles.periodTypeLabel}>Select Period Type:</Text>
                        <View style={styles.periodTypeButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.periodTypeButton,
                                    statisticsState.selectedPeriodType === 'month' && styles.periodTypeButtonActive
                                ]}
                                onPress={() => handlePeriodTypeChange('month')}
                            >
                                <Text style={[
                                    styles.periodTypeButtonText,
                                    statisticsState.selectedPeriodType === 'month' && styles.periodTypeButtonTextActive
                                ]}>Month</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.periodTypeButton,
                                    statisticsState.selectedPeriodType === 'quarter' && styles.periodTypeButtonActive
                                ]}
                                onPress={() => handlePeriodTypeChange('quarter')}
                            >
                                <Text style={[
                                    styles.periodTypeButtonText,
                                    statisticsState.selectedPeriodType === 'quarter' && styles.periodTypeButtonTextActive
                                ]}>Quarter</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.periodTypeButton,
                                    statisticsState.selectedPeriodType === 'year' && styles.periodTypeButtonActive
                                ]}
                                onPress={() => handlePeriodTypeChange('year')}
                            >
                                <Text style={[
                                    styles.periodTypeButtonText,
                                    statisticsState.selectedPeriodType === 'year' && styles.periodTypeButtonTextActive
                                ]}>Year</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Year Selection */}
                    <View style={styles.selectionContainer}>
                        <Text style={styles.selectionLabel}>Year:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScrollView}>
                            {statisticsState.availableYears.map(year => (
                                <TouchableOpacity
                                    key={year}
                                    style={[
                                        styles.yearButton,
                                        statisticsState.selectedYear === year && styles.yearButtonActive
                                    ]}
                                    onPress={() => handleYearChange(year)}
                                >
                                    <Text style={[
                                        styles.yearButtonText,
                                        statisticsState.selectedYear === year && styles.yearButtonTextActive
                                    ]}>{year}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Month/Quarter Selection */}
                    {statisticsState.selectedPeriodType === 'month' && (
                        <View style={styles.selectionContainer}>
                            <Text style={styles.selectionLabel}>Month:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScrollView}>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[
                                            styles.monthButton,
                                            statisticsState.selectedMonth === i && styles.monthButtonActive
                                        ]}
                                        onPress={() => handleMonthChange(i)}
                                    >
                                        <Text style={[
                                            styles.monthButtonText,
                                            statisticsState.selectedMonth === i && styles.monthButtonTextActive
                                        ]}>{StatisticsService.getMonthName(i)}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {statisticsState.selectedPeriodType === 'quarter' && (
                        <View style={styles.selectionContainer}>
                            <Text style={styles.selectionLabel}>Quarter:</Text>
                            <View style={styles.quarterButtons}>
                                {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map(quarter => (
                                    <TouchableOpacity
                                        key={quarter}
                                        style={[
                                            styles.quarterButton,
                                            statisticsState.selectedQuarter === quarter && styles.quarterButtonActive
                                        ]}
                                        onPress={() => handleQuarterChange(quarter)}
                                    >
                                        <Text style={[
                                            styles.quarterButtonText,
                                            statisticsState.selectedQuarter === quarter && styles.quarterButtonTextActive
                                        ]}>{quarter}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Current Selection Period Stats */}
                    <View style={styles.currentStatsContainer}>
                        <Text style={styles.currentStatsTitle}>
                            📈 {statisticsState.currentStats.period} Statistics
                        </Text>
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <Text style={styles.statCardLabel}>Working Days</Text>
                                <Text style={styles.statCardValue}>{statisticsState.currentStats.workingDays}</Text>
                                <Text style={styles.statCardSubtext}>(Mon-Fri)</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statCardLabel}>Office Days</Text>
                                <Text style={styles.statCardValue}>{statisticsState.currentStats.officeDays}</Text>
                                <Text style={styles.statCardSubtext}>(Logged)</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statCardLabel}>Attendance</Text>
                                <Text style={styles.statCardValue}>{statisticsState.currentStats.percentage}%</Text>
                                <Text style={styles.statCardSubtext}>(Rate)</Text>
                            </View>
                        </View>
                    </View>

                    {/* Quarter Configuration Section */}
                    <View style={styles.quarterConfigSection}>
                        <Text style={styles.quarterConfigTitle}>⚙️ Quarter Configuration</Text>
                        <Text style={styles.quarterConfigSubtitle}>
                            Configure which months belong to each quarter
                        </Text>

                        {/* Q1 Configuration */}
                        <View style={styles.quarterConfigRow}>
                            <Text style={styles.quarterLabel}>Q1:</Text>
                            <View style={styles.monthToggleContainer}>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[
                                            styles.monthToggle,
                                            quarterConfig.Q1.includes(i) && styles.monthToggleActive
                                        ]}
                                        onPress={() => {
                                            const newConfig = { ...quarterConfig };
                                            if (newConfig.Q1.includes(i)) {
                                                newConfig.Q1 = newConfig.Q1.filter(m => m !== i);
                                            } else {
                                                newConfig.Q1.push(i);
                                            }
                                            setQuarterConfig(newConfig);
                                        }}
                                    >
                                        <Text style={[
                                            styles.monthToggleText,
                                            quarterConfig.Q1.includes(i) && styles.monthToggleTextActive
                                        ]}>
                                            {StatisticsService.getMonthName(i).substring(0, 3)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Q2 Configuration */}
                        <View style={styles.quarterConfigRow}>
                            <Text style={styles.quarterLabel}>Q2:</Text>
                            <View style={styles.monthToggleContainer}>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[
                                            styles.monthToggle,
                                            quarterConfig.Q2.includes(i) && styles.monthToggleActive
                                        ]}
                                        onPress={() => {
                                            const newConfig = { ...quarterConfig };
                                            if (newConfig.Q2.includes(i)) {
                                                newConfig.Q2 = newConfig.Q2.filter(m => m !== i);
                                            } else {
                                                newConfig.Q2.push(i);
                                            }
                                            setQuarterConfig(newConfig);
                                        }}
                                    >
                                        <Text style={[
                                            styles.monthToggleText,
                                            quarterConfig.Q2.includes(i) && styles.monthToggleTextActive
                                        ]}>
                                            {StatisticsService.getMonthName(i).substring(0, 3)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Q3 Configuration */}
                        <View style={styles.quarterConfigRow}>
                            <Text style={styles.quarterLabel}>Q3:</Text>
                            <View style={styles.monthToggleContainer}>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[
                                            styles.monthToggle,
                                            quarterConfig.Q3.includes(i) && styles.monthToggleActive
                                        ]}
                                        onPress={() => {
                                            const newConfig = { ...quarterConfig };
                                            if (newConfig.Q3.includes(i)) {
                                                newConfig.Q3 = newConfig.Q3.filter(m => m !== i);
                                            } else {
                                                newConfig.Q3.push(i);
                                            }
                                            setQuarterConfig(newConfig);
                                        }}
                                    >
                                        <Text style={[
                                            styles.monthToggleText,
                                            quarterConfig.Q3.includes(i) && styles.monthToggleTextActive
                                        ]}>
                                            {StatisticsService.getMonthName(i).substring(0, 3)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Q4 Configuration */}
                        <View style={styles.quarterConfigRow}>
                            <Text style={styles.quarterLabel}>Q4:</Text>
                            <View style={styles.monthToggleContainer}>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[
                                            styles.monthToggle,
                                            quarterConfig.Q4.includes(i) && styles.monthToggleActive
                                        ]}
                                        onPress={() => {
                                            const newConfig = { ...quarterConfig };
                                            if (newConfig.Q4.includes(i)) {
                                                newConfig.Q4 = newConfig.Q4.filter(m => m !== i);
                                            } else {
                                                newConfig.Q4.push(i);
                                            }
                                            setQuarterConfig(newConfig);
                                        }}
                                    >
                                        <Text style={[
                                            styles.monthToggleText,
                                            quarterConfig.Q4.includes(i) && styles.monthToggleTextActive
                                        ]}>
                                            {StatisticsService.getMonthName(i).substring(0, 3)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Configuration Actions */}
                        <View style={styles.configActions}>
                            <TouchableOpacity
                                style={styles.saveConfigButton}
                                onPress={() => {
                                    StatisticsService.setQuarterConfig(quarterConfig);
                                    // Refresh statistics with new configuration
                                    updateStatisticsState();
                                    Alert.alert('Success!', 'Quarter configuration saved successfully!');
                                }}
                            >
                                <Text style={styles.saveConfigButtonText}>💾 Save Configuration</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.resetConfigButton}
                                onPress={() => {
                                    const defaultConfig = {
                                        Q1: [0, 1, 2],   // January, February, March
                                        Q2: [3, 4, 5],   // April, May, June
                                        Q3: [6, 7, 8],   // July, August, September
                                        Q4: [9, 10, 11]  // October, November, December
                                    };
                                    setQuarterConfig(defaultConfig);
                                    StatisticsService.setQuarterConfig(defaultConfig);
                                    updateStatisticsState();
                                    Alert.alert('Reset Complete', 'Quarter configuration reset to default!');
                                }}
                            >
                                <Text style={styles.resetConfigButtonText}>🔄 Reset to Default</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 10,
    },
    backButtonText: {
        fontSize: 18,
        color: '#007AFF',
        fontWeight: '600',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    placeholder: {
        width: 60,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    statsSection: {
        width: '100%',
        marginTop: 20,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    statsSectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    periodTypeContainer: {
        width: '100%',
        marginBottom: 20,
    },
    periodTypeLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginBottom: 10,
        textAlign: 'center',
    },
    periodTypeButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    periodTypeButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    periodTypeButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    periodTypeButtonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    periodTypeButtonTextActive: {
        color: '#ffffff',
    },
    selectionContainer: {
        width: '100%',
        marginBottom: 20,
    },
    selectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginBottom: 10,
        textAlign: 'center',
    },
    yearScrollView: {
        maxHeight: 50,
    },
    yearButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    yearButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    yearButtonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    yearButtonTextActive: {
        color: '#ffffff',
    },
    monthScrollView: {
        maxHeight: 50,
    },
    monthButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    monthButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    monthButtonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    monthButtonTextActive: {
        color: '#ffffff',
    },
    quarterButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    quarterButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    quarterButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    quarterButtonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    quarterButtonTextActive: {
        color: '#ffffff',
    },
    currentStatsContainer: {
        width: '100%',
        marginTop: 25,
        marginBottom: 25,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    currentStatsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 15,
        marginHorizontal: 5,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#dee2e6',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    statCardLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
    },
    statCardValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 5,
    },
    statCardSubtext: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
    quarterConfigSection: {
        width: '100%',
        marginTop: 20,
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    quarterConfigTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    quarterConfigSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    quarterConfigRow: {
        marginBottom: 15,
    },
    quarterLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    monthToggleContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    monthToggle: {
        backgroundColor: '#ffffff',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#dee2e6',
        minWidth: 45,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    monthToggleActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    monthToggleText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    monthToggleTextActive: {
        color: '#ffffff',
        fontWeight: '600',
    },
    configActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        gap: 15,
    },
    saveConfigButton: {
        backgroundColor: '#34C759',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    saveConfigButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    resetConfigButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    resetConfigButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

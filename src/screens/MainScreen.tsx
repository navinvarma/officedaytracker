import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    Modal,
    FlatList,
} from 'react-native';
import * as Calendar from 'expo-calendar';



interface OfficeDayEvent {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
}

interface MonthStats {
    workingDays: number;
    officeDays: number;
    percentage: number;
}

export default function MainScreen() {
    const [isLoggedToday, setIsLoggedToday] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [hasPermissions, setHasPermissions] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showPastEvents, setShowPastEvents] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [pastOfficeDays, setPastOfficeDays] = useState<OfficeDayEvent[]>([]);
    const [monthStats, setMonthStats] = useState<MonthStats>({ workingDays: 0, officeDays: 0, percentage: 0 });
    const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);

    useEffect(() => {
        setupApp();
    }, []);

    // Refresh calendar data when date picker becomes visible
    useEffect(() => {
        if (showDatePicker) {
            loadPastOfficeDays();
        }
    }, [showDatePicker]);

    // Recalculate month stats whenever pastOfficeDays changes
    useEffect(() => {
        calculateMonthStats();
    }, [pastOfficeDays]);

    const setupApp = async () => {
        try {
            // Request permissions
            const calendarPermission = await Calendar.requestCalendarPermissionsAsync();

            if (calendarPermission.status === 'granted') {
                setHasPermissions(true);
                checkIfLoggedToday();
                loadPastOfficeDays();
                // calculateMonthStats() will be called automatically by useEffect when pastOfficeDays updates
            } else {
                setHasPermissions(false);
                setIsChecking(false);
            }
        } catch (error) {
            console.error('Error setting up app:', error);
            setHasPermissions(false);
            setIsChecking(false);
        }
    };

    const checkIfLoggedToday = async () => {
        try {
            setIsChecking(true);
            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
            const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];

            if (!defaultCalendar) {
                setIsLoggedToday(false);
                return;
            }

            const today = new Date();
            // Use UTC dates to avoid timezone issues
            const startDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
            const endDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1));

            const events = await Calendar.getEventsAsync(
                [defaultCalendar.id],
                startDate,
                endDate
            );

            const hasOfficeDay = events.some(event =>
                event.title === 'Office Day' && event.allDay === true
            );

            setIsLoggedToday(hasOfficeDay);
        } catch (error) {
            console.error('Error checking if logged today:', error);
            setIsLoggedToday(false);
        } finally {
            setIsChecking(false);
        }
    };

    const loadPastOfficeDays = async () => {
        try {
            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
            const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];

            if (!defaultCalendar) return;

            // Get events from the last 6 months
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 6);

            const events = await Calendar.getEventsAsync(
                [defaultCalendar.id],
                startDate,
                endDate
            );

            const officeDayEvents = events
                .filter(event => event.title === 'Office Day' && event.allDay === true)
                .map(event => {
                    // For UTC events, we need to create a local date that represents the same calendar day
                    // without timezone conversion affecting the display
                    const eventDate = new Date(event.startDate);

                    // If this is a UTC event (which our app creates), extract the UTC date components
                    // and create a local date with the same year, month, and day
                    if (event.timeZone === 'UTC') {
                        const utcYear = eventDate.getUTCFullYear();
                        const utcMonth = eventDate.getUTCMonth();
                        const utcDate = eventDate.getUTCDate();

                        // Create a local date with the same calendar date as the UTC event
                        const localDate = new Date(utcYear, utcMonth, utcDate);

                        return {
                            id: event.id,
                            title: event.title,
                            startDate: localDate,
                            endDate: new Date(event.endDate),
                        };
                    }

                    // For non-UTC events, use the original logic
                    if (event.timeZone && event.timeZone !== 'UTC') {
                        // For non-UTC events, ensure we get the correct local date
                        const localStartDate = new Date(eventDate.getTime() + eventDate.getTimezoneOffset() * 60000);
                        return {
                            id: event.id,
                            title: event.title,
                            startDate: localStartDate,
                            endDate: new Date(event.endDate),
                        };
                    }

                    // Default case: use the date as-is
                    return {
                        id: event.id,
                        title: event.title,
                        startDate: eventDate,
                        endDate: new Date(event.endDate),
                    };
                })
                .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

            setPastOfficeDays(officeDayEvents);
        } catch (error) {
            console.error('Error loading past office days:', error);
        }
    };

    const calculateMonthStats = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let workingDays = 0;
        let officeDays = 0;

        // First, count working days (Mon-Fri) in the current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();

            // Monday = 1, Tuesday = 2, ..., Friday = 5
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                workingDays++;
            }
        }

        // Then, count all office days in the current month (regardless of day of week)
        // Use UTC methods to ensure consistent date comparison
        officeDays = pastOfficeDays.filter(event => {
            const eventDate = new Date(event.startDate);
            // Use UTC methods to avoid timezone conversion issues
            return eventDate.getUTCMonth() === month &&
                eventDate.getUTCFullYear() === year;
        }).length;

        const percentage = workingDays > 0 ? Math.round((officeDays / workingDays) * 100) : 0;
        setMonthStats({ workingDays, officeDays, percentage });
    };

    const handleLogOfficeDay = async () => {
        if (!hasPermissions) {
            Alert.alert(
                'Permissions Required',
                'Please grant calendar permissions to use this app.',
                [{ text: 'OK' }]
            );
            return;
        }

        try {
            setIsLoading(true);

            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
            const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];

            if (!defaultCalendar) {
                throw new Error('No calendar available');
            }

            // Create dates in UTC to avoid timezone issues
            const startDate = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()));
            const endDate = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1));

            await Calendar.createEventAsync(defaultCalendar.id, {
                title: 'Office Day',
                startDate: startDate,
                endDate: endDate,
                allDay: true,
                timeZone: 'UTC', // Use UTC to avoid timezone conversion issues
                location: 'Office',
                notes: 'Logged via Office Day Tracker app',
            });

            // If logging for today, update the today status
            const today = new Date();
            if (selectedDate.toDateString() === today.toDateString()) {
                setIsLoggedToday(true);
            }

            Alert.alert('Success!', `Office Day logged for ${formatDate(selectedDate)}!`, [{ text: 'OK' }]);

            // Reset selected date to today
            setSelectedDate(new Date());

            // Refresh data
            await loadPastOfficeDays();
            calculateMonthStats();
            // Force calendar refresh if date picker is open
            if (showDatePicker) {
                setCalendarRefreshKey(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error logging office day:', error);
            Alert.alert('Error', 'Failed to log office day. Please try again.', [{ text: 'OK' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const openDatePicker = async () => {
        // Refresh past office days data before opening the date picker
        await loadPastOfficeDays();
        setCalendarRefreshKey(prev => prev + 1);
        setShowDatePicker(true);
    };

    const refreshCalendarData = async () => {
        await loadPastOfficeDays();
    };

    const deleteOfficeDay = async (eventId: string, eventDate: Date) => {
        try {
            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
            const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];

            if (!defaultCalendar) {
                throw new Error('No calendar available');
            }

            // Delete the event from calendar
            await Calendar.deleteEventAsync(eventId);

            // Refresh data
            await loadPastOfficeDays();
            calculateMonthStats();

            // Force calendar refresh if date picker is open
            if (showDatePicker) {
                setCalendarRefreshKey(prev => prev + 1);
            }

            // Update today status if deleting today's event
            const today = new Date();
            if (eventDate.toDateString() === today.toDateString()) {
                setIsLoggedToday(false);
            }

            Alert.alert('Success!', 'Office day deleted successfully!', [{ text: 'OK' }]);
        } catch (error) {
            console.error('Error deleting office day:', error);
            Alert.alert('Error', 'Failed to delete office day. Please try again.', [{ text: 'OK' }]);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateShort = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const isDateInPast = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return date < today;
    };

    const renderCalendarDays = () => {
        const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay(); // 0 for Sunday, 6 for Saturday

        const days: React.ReactElement[] = [];

        // Add empty divs for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<View key={`empty-${i}`} style={styles.calendarDayCell} />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isOfficeDay = pastOfficeDays.some(event => {
                const eventDate = new Date(event.startDate);
                return eventDate.getDate() === day &&
                    eventDate.getMonth() === selectedDate.getMonth() &&
                    eventDate.getFullYear() === selectedDate.getFullYear();
            });

            days.push(
                <TouchableOpacity
                    key={`day-${day}`}
                    style={[
                        styles.calendarDayCell,
                        isSelected && styles.selectedDayCell,
                        isOfficeDay && styles.officeDayCell,
                        isToday && styles.todayCell
                    ]}
                    onPress={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(day);
                        setSelectedDate(newDate);
                    }}
                    onLongPress={() => {
                        if (isOfficeDay) {
                            const eventDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                            const event = pastOfficeDays.find(event => {
                                const eventDateObj = new Date(event.startDate);
                                return eventDateObj.getDate() === day &&
                                    eventDateObj.getMonth() === selectedDate.getMonth() &&
                                    eventDateObj.getFullYear() === selectedDate.getFullYear();
                            });

                            if (event) {
                                Alert.alert(
                                    'Delete Office Day',
                                    `Are you sure you want to delete the office day for ${formatDate(eventDate)}?`,
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        { text: 'Delete', style: 'destructive', onPress: () => deleteOfficeDay(event.id, eventDate) }
                                    ]
                                );
                            }
                        }
                    }}
                >
                    <Text style={[styles.calendarDayText, isSelected && styles.selectedDayText]}>
                        {day}
                    </Text>
                </TouchableOpacity>
            );
        }
        return days;
    };

    if (isChecking) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Setting up app...</Text>
            </View>
        );
    }

    if (!hasPermissions) {
        return (
            <View style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionTitle}>Permissions Required</Text>
                    <Text style={styles.permissionText}>
                        This app needs access to your calendar to function properly.
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={setupApp}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with Menu Button */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setShowMenu(true)}
                >
                    <Text style={styles.menuButtonText}>☰</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Office Day Tracker</Text>
                <View style={styles.placeholder} />
            </View>

            <Text style={styles.subtitle}>
                {isLoggedToday
                    ? "You've logged your office day today!"
                    : "Tap the button below to log your office day"
                }
            </Text>

            {/* Date Selection */}
            <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>Date:</Text>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={openDatePicker}
                    testID="date-picker-button"
                >
                    <Text style={styles.dateButtonText}>
                        {formatDateShort(selectedDate)}
                        {isDateInPast(selectedDate) ? ' (Past)' : ''}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Main Log Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.logButton,
                        isLoading && styles.logButtonDisabled
                    ]}
                    onPress={handleLogOfficeDay}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            Log Office Day
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Your office day will be logged as an all-day event in your default calendar.
                </Text>
            </View>

            {/* Custom Date Picker Modal */}
            <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowDatePicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.datePickerModal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Date</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.datePickerScrollView}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.datePickerScrollContent}
                        >
                            <Text style={styles.datePickerLabel}>Current: {formatDateShort(selectedDate)}</Text>

                            {/* Calendar Navigation */}
                            <View style={styles.calendarHeader}>
                                <TouchableOpacity
                                    style={styles.calendarNavButton}
                                    onPress={async () => {
                                        const newDate = new Date(selectedDate);
                                        newDate.setMonth(newDate.getMonth() - 1);
                                        setSelectedDate(newDate);
                                        // Refresh data for the new month
                                        await loadPastOfficeDays();
                                    }}
                                >
                                    <Text style={styles.calendarNavButtonText}>‹</Text>
                                </TouchableOpacity>

                                <Text style={styles.calendarMonthText}>
                                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </Text>

                                <TouchableOpacity
                                    style={styles.calendarNavButton}
                                    onPress={async () => {
                                        const newDate = new Date(selectedDate);
                                        newDate.setMonth(newDate.getMonth() + 1);
                                        if (newDate <= new Date()) {
                                            setSelectedDate(newDate);
                                            // Refresh data for the new month
                                            await loadPastOfficeDays();
                                        }
                                    }}
                                    disabled={selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear()}
                                >
                                    <Text style={[
                                        styles.calendarNavButtonText,
                                        (selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear()) && styles.calendarNavButtonDisabled
                                    ]}>›</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Calendar Grid */}
                            <View style={styles.calendarGrid} key={calendarRefreshKey}>
                                {/* Day Headers */}
                                <View style={styles.calendarDayHeaders}>
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <Text key={day} style={styles.calendarDayHeader}>{day}</Text>
                                    ))}
                                </View>

                                {/* Calendar Days */}
                                <View style={styles.calendarDaysContainer}>
                                    {renderCalendarDays()}
                                </View>
                            </View>

                            {/* Quick Preset Buttons */}
                            <View style={styles.presetButtonsContainer}>
                                <TouchableOpacity
                                    style={styles.presetButton}
                                    onPress={() => {
                                        const today = new Date();
                                        setSelectedDate(today);
                                    }}
                                >
                                    <Text style={styles.presetButtonText}>Today</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.presetButton}
                                    onPress={() => {
                                        const yesterday = new Date();
                                        yesterday.setDate(yesterday.getDate() - 1);
                                        setSelectedDate(yesterday);
                                    }}
                                >
                                    <Text style={styles.presetButtonText}>Yesterday</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Confirm Button */}
                            <TouchableOpacity
                                style={styles.confirmDateButton}
                                onPress={() => setShowDatePicker(false)}
                            >
                                <Text style={styles.confirmDateButtonText}>Confirm Date</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Menu Modal */}
            <Modal
                visible={showMenu}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowMenu(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.menuModal}>
                        <View style={styles.menuHeader}>
                            <Text style={styles.menuTitle}>Menu</Text>
                            <TouchableOpacity onPress={() => setShowMenu(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setShowMenu(false);
                                setShowPastEvents(true);
                            }}
                        >
                            <Text style={styles.menuItemText}>📅 Past Office Days</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setShowMenu(false);
                                setShowCalendar(true);
                            }}
                        >
                            <Text style={styles.menuItemText}>📊 Month Statistics</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Past Events Modal */}
            <Modal
                visible={showPastEvents}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowPastEvents(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.listModal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Past Office Days</Text>
                            <TouchableOpacity onPress={() => setShowPastEvents(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.deleteInstructionText}>
                            Tap the 🗑️ button to delete an office day
                        </Text>
                        <FlatList
                            data={pastOfficeDays}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={styles.eventItem}>
                                    <View style={styles.eventInfo}>
                                        <Text style={styles.eventDate}>{formatDate(item.startDate)}</Text>
                                        <Text style={styles.eventTitle}>{item.title}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => {
                                            Alert.alert(
                                                'Delete Office Day',
                                                `Are you sure you want to delete the office day for ${formatDate(item.startDate)}?`,
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    { text: 'Delete', style: 'destructive', onPress: () => deleteOfficeDay(item.id, item.startDate) }
                                                ]
                                            );
                                        }}
                                    >
                                        <Text style={styles.deleteButtonText}>🗑️</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No office days logged yet</Text>
                            }
                        />
                    </View>
                </View>
            </Modal>

            {/* Calendar Statistics Modal */}
            <Modal
                visible={showCalendar}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCalendar(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.statsModal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Month Statistics</Text>
                            <TouchableOpacity onPress={() => setShowCalendar(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Working Days (Mon-Fri)</Text>
                                <Text style={styles.statValue}>{monthStats.workingDays}</Text>
                            </View>

                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Office Days</Text>
                                <Text style={styles.statValue}>{monthStats.officeDays}</Text>
                            </View>

                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Attendance Rate</Text>
                                <Text style={styles.statValue}>{monthStats.percentage}%</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingTop: 50,
        paddingBottom: 20,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    menuButton: {
        padding: 10,
    },
    menuButtonText: {
        fontSize: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 60,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 60,
    },
    logButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 20,
        paddingHorizontal: 40,
        borderRadius: 25,
        minWidth: 200,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    logButtonLogged: {
        backgroundColor: '#34C759',
    },
    logButtonDisabled: {
        backgroundColor: '#999',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        paddingHorizontal: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
    },
    permissionContainer: {
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    permissionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    permissionText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 15,
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        minWidth: 200,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    retryButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    menuModal: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        alignItems: 'center',
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    menuTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        fontSize: 24,
    },
    menuItem: {
        width: '100%',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuItemText: {
        fontSize: 18,
        color: '#333',
    },
    listModal: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        alignItems: 'center',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    eventItem: {
        width: '100%',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    eventInfo: {
        flex: 1,
    },
    eventDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    deleteButton: {
        padding: 8,
        backgroundColor: '#ffebee',
        borderRadius: 20,
        marginLeft: 10,
    },
    deleteButtonText: {
        fontSize: 16,
        color: '#d32f2f',
    },
    deleteInstructionText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 15,
        fontStyle: 'italic',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    },
    statsModal: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        alignItems: 'center',
    },
    statsContainer: {
        width: '100%',
        marginTop: 20,
    },
    statItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    statLabel: {
        fontSize: 16,
        color: '#666',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    dateContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    dateLabel: {
        fontSize: 18,
        color: '#333',
        marginBottom: 10,
    },
    dateButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        minWidth: 200,
        alignItems: 'center',
    },
    dateButtonText: {
        fontSize: 18,
        color: '#333',
    },
    placeholder: {
        width: 50, // Adjust as needed
    },
    datePickerModal: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        alignItems: 'center',
    },
    datePickerScrollView: {
        width: '100%',
        maxHeight: 400,
    },
    datePickerScrollContent: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    datePickerContainer: {
        width: '100%',
        alignItems: 'center',
    },
    datePickerLabel: {
        fontSize: 18,
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    dateButtonsContainer: {
        width: '100%',
        gap: 15,
    },
    dateOptionButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    dateOptionButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 15,
    },
    calendarMonthText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    calendarNavButton: {
        padding: 10,
    },
    calendarNavButtonText: {
        fontSize: 24,
        color: '#007AFF',
    },
    calendarNavButtonDisabled: {
        color: '#999',
    },
    calendarGrid: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 10,
        overflow: 'hidden',
    },
    calendarDaysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
    },
    calendarDayHeaders: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        backgroundColor: '#f5f5f5',
    },
    calendarDayHeader: {
        fontSize: 14,
        color: '#666',
        fontWeight: 'bold',
    },
    calendarDayCell: {
        width: '14.28%', // 7 columns for 7 days
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    calendarDayText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    selectedDayCell: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
    },
    selectedDayText: {
        color: '#ffffff',
    },
    officeDayCell: {
        backgroundColor: '#e0f7fa', // Light blue for office days
        borderRadius: 10,
    },
    todayCell: {
        backgroundColor: '#e0f7fa', // Light blue for today
        borderRadius: 10,
    },
    presetButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
        marginBottom: 20,
    },
    presetButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 10,
        alignItems: 'center',
    },
    presetButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    confirmDateButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        minWidth: 200,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    confirmDateButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});


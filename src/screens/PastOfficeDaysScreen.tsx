import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    FlatList,
} from 'react-native';

interface OfficeDayEvent {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
}

interface PastOfficeDaysScreenProps {
    pastOfficeDays: OfficeDayEvent[];
    onBack: () => void;
    onDeleteOfficeDay: (eventId: string, eventDate: Date) => void;
}

export default function PastOfficeDaysScreen({ pastOfficeDays, onBack, onDeleteOfficeDay }: PastOfficeDaysScreenProps) {
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Function to check if a date is a duplicate
    const isDuplicate = (date: Date, index: number) => {
        const dateString = date.toDateString();
        return pastOfficeDays.findIndex((event, i) =>
            new Date(event.startDate).toDateString() === dateString && i !== index
        ) !== -1;
    };

    const renderEventItem = ({ item, index }: { item: OfficeDayEvent; index: number }) => {
        const isDuplicateEntry = isDuplicate(item.startDate, index);

        return (
            <View style={[
                styles.eventItem,
                isDuplicateEntry && styles.duplicateEventItem
            ]}>
                <View style={styles.eventInfo}>
                    <Text style={styles.eventDate}>{formatDate(item.startDate)}</Text>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                    {isDuplicateEntry && (
                        <Text style={styles.duplicateWarning}>⚠️ Duplicate Entry</Text>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                        Alert.alert(
                            'Delete Office Day',
                            `Are you sure you want to delete the office day for ${formatDate(item.startDate)}?`,
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete', style: 'destructive', onPress: () => onDeleteOfficeDay(item.id, item.startDate) }
                            ]
                        );
                    }}
                >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>📅 Past Office Days</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
                <Text style={styles.deleteInstructionText}>
                    Tap the 🗑️ button to delete an office day
                </Text>

                <FlatList
                    data={pastOfficeDays}
                    keyExtractor={(item) => item.id}
                    renderItem={renderEventItem}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No office days logged yet</Text>
                    }
                />
            </View>
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    deleteInstructionText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 15,
        fontStyle: 'italic',
    },
    eventItem: {
        width: '100%',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
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
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 50,
        fontStyle: 'italic',
    },
    duplicateEventItem: {
        backgroundColor: '#ffebee', // Light red background for duplicates
        borderColor: '#ef5350', // Red border for duplicates
        borderWidth: 2,
    },
    duplicateWarning: {
        fontSize: 12,
        color: '#ef5350',
        marginTop: 5,
        fontStyle: 'italic',
    },
});

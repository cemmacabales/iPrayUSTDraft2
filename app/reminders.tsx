import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { VERSE_OF_THE_DAY } from '../constants/prayers';
import { colors, commonStyles } from '../constants/styles';

export default function RemindersPage() {
  const [morningReminder, setMorningReminder] = useState(false);
  const [eveningReminder, setEveningReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');

  return (
    <View style={[commonStyles.container, styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.push('/main')}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary[600]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Daily Reminders
          </Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Set up prayer reminders and stay inspired
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Verse of the Day */}
        <View style={styles.verseCard}>
          <View style={styles.verseHeader}>
            <Ionicons name="bookmark" size={24} color="white" />
            <Text style={styles.verseTitle}>
              Memory Verse of the Day
            </Text>
          </View>
          <Text style={styles.verseText}>
            "{VERSE_OF_THE_DAY.verse}"
          </Text>
          <Text style={styles.verseReference}>
            — {VERSE_OF_THE_DAY.reference}
          </Text>
        </View>

        {/* Reminder Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>
            Prayer Reminders
          </Text>
          
          <View style={styles.reminderContainer}>
            {/* Morning Reminder */}
            <View style={styles.reminderItem}>
              <View style={styles.reminderContent}>
                <View style={styles.reminderIcon}>
                  <Ionicons name="sunny" size={20} color={colors.primary[600]} />
                </View>
                <View>
                  <Text style={styles.reminderTitle}>
                    Morning Prayer
                  </Text>
                  <Text style={styles.reminderSubtitle}>
                    Start your day with prayer
                  </Text>
                </View>
              </View>
              <Switch
                value={morningReminder}
                onValueChange={setMorningReminder}
                trackColor={{ false: '#e5e7eb', true: colors.primary[200] }}
                thumbColor={morningReminder ? colors.primary[600] : '#9ca3af'}
              />
            </View>

            {/* Evening Reminder */}
            <View style={styles.reminderItem}>
              <View style={styles.reminderContent}>
                <View style={styles.reminderIcon}>
                  <Ionicons name="moon" size={20} color={colors.primary[600]} />
                </View>
                <View>
                  <Text style={styles.reminderTitle}>
                    Evening Prayer
                  </Text>
                  <Text style={styles.reminderSubtitle}>
                    End your day with gratitude
                  </Text>
                </View>
              </View>
              <Switch
                value={eveningReminder}
                onValueChange={setEveningReminder}
                trackColor={{ false: '#e5e7eb', true: colors.primary[200] }}
                thumbColor={eveningReminder ? colors.primary[600] : '#9ca3af'}
              />
            </View>
          </View>
        </View>

        {/* Reminder Time */}
        <View style={styles.timeCard}>
          <Text style={styles.timeTitle}>
            Reminder Time
          </Text>
          <TouchableOpacity style={styles.timeSelector}>
            <View style={styles.timeContent}>
              <Ionicons name="time" size={20} color={colors.secondary[500]} />
              <Text style={styles.timeText}>
                {reminderTime}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondary[500]} />
          </TouchableOpacity>
        </View>

        {/* Quick Prayer Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>
            Quick Actions
          </Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="play-circle" size={24} color={colors.primary[600]} />
              <Text style={styles.actionText}>
                Start Prayer Timer
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="calendar" size={24} color={colors.primary[600]} />
              <Text style={styles.actionText}>
                View Prayer Calendar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="stats-chart" size={24} color={colors.primary[600]} />
              <Text style={styles.actionText}>
                Prayer Statistics
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>
            💡 Prayer Tips
          </Text>
          <View style={styles.tipsContainer}>
            <Text style={styles.tipText}>
              • Find a quiet place to pray
            </Text>
            <Text style={styles.tipText}>
              • Set aside dedicated time each day
            </Text>
            <Text style={styles.tipText}>
              • Use prayer reminders to build consistency
            </Text>
            <Text style={styles.tipText}>
              • Keep a prayer journal to track your journey
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary[50],
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[100],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary[800],
  },
  headerSubtitle: {
    color: colors.secondary[600],
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  verseCard: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  verseTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  verseText: {
    color: colors.primary[100],
    fontStyle: 'italic',
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 12,
  },
  verseReference: {
    color: colors.primary[200],
    fontWeight: '600',
  },
  settingsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary[800],
    marginBottom: 16,
  },
  reminderContainer: {
    gap: 16,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.primary[50],
    borderRadius: 8,
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary[100],
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary[800],
  },
  reminderSubtitle: {
    color: colors.secondary[600],
  },
  timeCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  timeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary[800],
    marginBottom: 16,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.secondary[50],
    borderRadius: 8,
  },
  timeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: colors.secondary[800],
    marginLeft: 8,
  },
  actionsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary[800],
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.primary[50],
    borderRadius: 8,
  },
  actionText: {
    color: colors.primary[800],
    fontWeight: '600',
    marginLeft: 12,
  },
  tipsCard: {
    backgroundColor: colors.secondary[50],
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.secondary[800],
    marginBottom: 12,
  },
  tipsContainer: {
    gap: 8,
  },
  tipText: {
    color: colors.secondary[700],
  },
});

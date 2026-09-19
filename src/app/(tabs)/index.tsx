// Powered by OnSpace.AI
import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTimetable } from '@/hooks/useTimetable';
import {
  getTodayDayIndex, getTodayString, getClassesForDay,
  getAttendanceForClass, formatTime,
} from '@/services/timetableUtils';
import ClassCard from '@/components/ui/ClassCard';
import EmptyState from '@/components/ui/EmptyState';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { DAYS } from '@/constants/config';

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function useNextClass(classes: ReturnType<typeof getClassesForDay>) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const nextClass = useMemo(() => {
    return classes
      .filter(c => timeToMinutes(c.startTime) > currentMinutes)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))[0] ?? null;
  }, [classes, currentMinutes]);

  const countdown = useMemo(() => {
    if (!nextClass) return null;
    const diff = timeToMinutes(nextClass.startTime) - currentMinutes;
    if (diff <= 0) return null;
    if (diff < 60) return `${diff} min`;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }, [nextClass, currentMinutes]);

  return { nextClass, countdown, now };
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const { classes, attendance, markAttendance, isLoading } = useTimetable();

  const today = useMemo(() => getTodayDayIndex(), []);
  const todayStr = useMemo(() => getTodayString(), []);
  const todayClasses = useMemo(() => getClassesForDay(classes, today, todayStr), [classes, today, todayStr]);

  const { nextClass, countdown, now } = useNextClass(todayClasses);

  const dateLabel = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const presentCount = todayClasses.filter(c =>
    getAttendanceForClass(attendance, c.id, todayStr) === 'present'
  ).length;

  const absentCount = todayClasses.filter(c =>
    getAttendanceForClass(attendance, c.id, todayStr) === 'absent'
  ).length;

  if (isLoading) {
    return (
      <View style={[styles.loader, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const nextColor = nextClass ? Colors.subjectColors[nextClass.colorIndex % Colors.subjectColors.length] : Colors.primary;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'} 👋
          </Text>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
        </View>
      </View>

      {/* Next class countdown banner */}
      {nextClass && countdown ? (
        <Pressable style={[styles.nextBanner, { borderLeftColor: nextColor }]}>
          <View style={[styles.nextDot, { backgroundColor: nextColor }]} />
          <View style={styles.nextInfo}>
            <Text style={styles.nextLabel}>Up next</Text>
            <Text style={styles.nextCourse} numberOfLines={1}>
              {nextClass.courseCode} · {nextClass.courseName}
            </Text>
          </View>
          <View style={styles.countdownPill}>
            <MaterialIcons name="schedule" size={13} color={Colors.primary} />
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        </Pressable>
      ) : todayClasses.length > 0 ? (
        <View style={[styles.nextBanner, { borderLeftColor: Colors.success }]}>
          <View style={[styles.nextDot, { backgroundColor: Colors.success }]} />
          <View style={styles.nextInfo}>
            <Text style={[styles.nextLabel, { color: Colors.success }]}>All done for today</Text>
            <Text style={styles.nextCourse}>No more classes remaining</Text>
          </View>
          <MaterialIcons name="check-circle" size={20} color={Colors.success} />
        </View>
      ) : null}

      {/* Summary chips */}
      {todayClasses.length > 0 && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryChip}>
            <MaterialIcons name="class" size={14} color={Colors.primary} />
            <Text style={styles.summaryText}>{todayClasses.length} classes</Text>
          </View>
          <View style={[styles.summaryChip, { backgroundColor: Colors.successDim }]}>
            <MaterialIcons name="check-circle" size={14} color={Colors.success} />
            <Text style={[styles.summaryText, { color: Colors.success }]}>{presentCount} present</Text>
          </View>
          <View style={[styles.summaryChip, { backgroundColor: Colors.dangerDim }]}>
            <MaterialIcons name="cancel" size={14} color={Colors.danger} />
            <Text style={[styles.summaryText, { color: Colors.danger }]}>{absentCount} absent</Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {todayClasses.length === 0 ? (
          <EmptyState
            icon="weekend"
            title="No classes today"
            subtitle="Enjoy your free day! Check the timetable for upcoming classes."
          />
        ) : (
          todayClasses.map(cls => {
            const status = getAttendanceForClass(attendance, cls.id, todayStr);
            return (
              <ClassCard
                key={cls.id}
                cls={cls}
                status={status}
                onPresent={() => markAttendance(cls.id, 'present')}
                onAbsent={() => markAttendance(cls.id, 'absent')}
                onClear={() => markAttendance(cls.id, 'none')}
              />
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  loader: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  dateLabel: {
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    marginTop: 2,
  },
  nextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
  },
  nextDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nextInfo: {
    flex: 1,
    gap: 1,
  },
  nextLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nextCourse: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryDim,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  countdownText: {
    fontSize: FontSize.sm,
    color: Colors.primaryLight,
    fontWeight: FontWeight.bold,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  summaryText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 4,
  },
});

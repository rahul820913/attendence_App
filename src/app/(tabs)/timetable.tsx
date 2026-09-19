// Powered by OnSpace.AI
import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTimetable } from '@/hooks/useTimetable';
import {
  getClassesForDay, getSubjectColor, formatTime, getWeekDates, getTodayDayIndex,
} from '@/services/timetableUtils';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { DAYS, DAYS_SHORT } from '@/constants/config';

export default function TimetableScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { classes, cancelClass, restoreClass } = useTimetable();
  const [selectedDay, setSelectedDay] = useState(getTodayDayIndex());
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const todayIndex = getTodayDayIndex();

  const dayClasses = useMemo(
    () => getClassesForDay(classes, selectedDay, weekDates[selectedDay]),
    [classes, selectedDay, weekDates]
  );

  const allDayClasses = useMemo(() =>
    DAYS.map((_, i) => ({
      count: getClassesForDay(classes, i, weekDates[i]).length,
    })), [classes, weekDates]
  );

  const weekLabel = useMemo(() => {
    const start = new Date(weekDates[0]);
    const end = new Date(weekDates[6]);
    return `${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }, [weekDates]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Timetable</Text>
        <Pressable
          onPress={() => router.push({ pathname: '/class-form', params: { dayIndex: selectedDay } })}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.75 }]}
        >
          <MaterialIcons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* Week Navigator */}
      <View style={styles.weekNav}>
        <Pressable onPress={() => setWeekOffset(o => o - 1)} style={styles.navBtn} hitSlop={8}>
          <MaterialIcons name="chevron-left" size={24} color={Colors.textSecondary} />
        </Pressable>
        <Pressable onPress={() => setWeekOffset(0)}>
          <Text style={styles.weekLabel}>{weekOffset === 0 ? 'This Week' : weekLabel}</Text>
        </Pressable>
        <Pressable onPress={() => setWeekOffset(o => o + 1)} style={styles.navBtn} hitSlop={8}>
          <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {/* Day Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayBarContent}
        style={styles.dayBar}
      >
        {DAYS.map((day, idx) => {
          const date = new Date(weekDates[idx]);
          const isSelected = selectedDay === idx;
          const isToday = weekOffset === 0 && todayIndex === idx;
          const count = allDayClasses[idx].count;
          return (
            <Pressable
              key={day}
              onPress={() => setSelectedDay(idx)}
              style={({ pressed }) => [
                styles.dayChip,
                isSelected && styles.dayChipSelected,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={[styles.dayShort, isSelected && styles.dayShortSelected]}>
                {DAYS_SHORT[idx]}
              </Text>
              <View style={[styles.dayNum, isToday && styles.dayNumToday, isSelected && styles.dayNumSelected]}>
                <Text style={[styles.dayNumText, (isSelected || isToday) && { color: '#fff' }]}>
                  {date.getDate()}
                </Text>
              </View>
              {count > 0 && (
                <View style={[styles.dotRow]}>
                  {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                    <View key={i} style={[styles.dot, isSelected && styles.dotSelected]} />
                  ))}
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Classes List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.dayTitle}>{DAYS[selectedDay]}, {new Date(weekDates[selectedDay]).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</Text>

        {dayClasses.length === 0 ? (
          <View style={styles.emptyDay}>
            <MaterialIcons name="event-available" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No classes scheduled</Text>
            <Pressable
              onPress={() => router.push({ pathname: '/class-form', params: { dayIndex: selectedDay } })}
              style={({ pressed }) => [styles.addClassBtn, pressed && { opacity: 0.75 }]}
            >
              <MaterialIcons name="add" size={16} color={Colors.primary} />
              <Text style={styles.addClassBtnText}>Add a class</Text>
            </Pressable>
          </View>
        ) : (
          dayClasses.map(cls => {
            const color = getSubjectColor(cls.colorIndex);
            return (
              <View key={cls.id} style={[styles.classRow, cls.isCancelled && styles.cancelledRow]}>
                <View style={styles.timeCol}>
                  <Text style={[styles.startTime, cls.isCancelled && styles.cancelledText]}>{formatTime(cls.startTime)}</Text>
                  <View style={[styles.timeLine, { backgroundColor: color + '40' }]} />
                  <Text style={[styles.endTime, cls.isCancelled && styles.cancelledText]}>{formatTime(cls.endTime)}</Text>
                </View>

                <View style={[styles.classBlock, { borderLeftColor: color, borderLeftWidth: 3 }, cls.isCancelled && styles.cancelledBlock]}>
                  {cls.isCancelled && (
                    <View style={styles.cancelledBadge}>
                      <Text style={styles.cancelledBadgeText}>CANCELLED</Text>
                    </View>
                  )}
                  {cls.isExtra && (
                    <View style={styles.extraBadge}>
                      <Text style={styles.extraBadgeText}>EXTRA</Text>
                    </View>
                  )}
                  <Text style={[styles.blockCode, { color }, cls.isCancelled && styles.cancelledText]}>{cls.courseCode}</Text>
                  <Text style={[styles.blockName, cls.isCancelled && styles.cancelledText]} numberOfLines={1}>{cls.courseName}</Text>
                  <Text style={[styles.blockFaculty, cls.isCancelled && styles.cancelledText]}>{cls.facultyName}</Text>
                  {cls.room ? (
                    <View style={styles.roomRow}>
                      <MaterialIcons name="room" size={12} color={cls.isCancelled ? Colors.cancelled : Colors.textMuted} />
                      <Text style={[styles.blockRoom, cls.isCancelled && styles.cancelledText]}>{cls.room}</Text>
                    </View>
                  ) : null}

                  <View style={styles.classActions}>
                    <Pressable
                      onPress={() => router.push({ pathname: '/class-form', params: { editId: cls.id } })}
                      style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
                      hitSlop={6}
                    >
                      <MaterialIcons name="edit" size={16} color={Colors.textMuted} />
                    </Pressable>
                    <Pressable
                      onPress={() => cls.isCancelled ? restoreClass(cls.id) : cancelClass(cls.id)}
                      style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
                      hitSlop={6}
                    >
                      <MaterialIcons
                        name={cls.isCancelled ? "replay" : "block"}
                        size={16}
                        color={cls.isCancelled ? Colors.success : Colors.warning}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  addBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  navBtn: { padding: 4 },
  weekLabel: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  dayBar: { maxHeight: 90 },
  dayBarContent: {
    paddingHorizontal: Spacing.md,
    gap: 6,
    alignItems: 'center',
  },
  dayChip: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
    minWidth: 44,
  },
  dayChipSelected: {
    backgroundColor: Colors.surfaceElevated,
  },
  dayShort: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
    marginBottom: 4,
  },
  dayShortSelected: { color: Colors.primary },
  dayNum: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  dayNumToday: { backgroundColor: Colors.primaryDim },
  dayNumSelected: { backgroundColor: Colors.primary },
  dayNumText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
  },
  dotRow: { flexDirection: 'row', gap: 2, marginTop: 3, height: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.textMuted },
  dotSelected: { backgroundColor: Colors.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  dayTitle: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 50,
    gap: 10,
  },
  emptyText: {
    fontSize: FontSize.base,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  addClassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginTop: 4,
  },
  addClassBtnText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  classRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  cancelledRow: { opacity: 0.5 },
  timeCol: {
    width: 56,
    alignItems: 'center',
    paddingTop: 4,
  },
  startTime: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  endTime: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  timeLine: {
    width: 1.5,
    flex: 1,
    marginVertical: 3,
    minHeight: 20,
  },
  classBlock: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 3,
    position: 'relative',
  },
  cancelledBlock: {
    backgroundColor: Colors.surfaceElevated,
  },
  cancelledBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.cancelled,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cancelledBadgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  extraBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  extraBadgeText: {
    fontSize: 9,
    color: '#000',
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  blockCode: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  blockName: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  blockFaculty: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  blockRoom: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  cancelledText: { color: Colors.cancelled },
  classActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 6,
    justifyContent: 'flex-end',
  },
  iconBtn: {
    padding: 4,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 6,
  },
});

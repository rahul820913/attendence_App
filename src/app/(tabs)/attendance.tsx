// Powered by OnSpace.AI
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTimetable } from '@/hooks/useTimetable';
import { getAttendanceStats, getSubjectColor } from '@/services/timetableUtils';
import AttendanceRing from '@/components/ui/AttendanceRing';
import EmptyState from '@/components/ui/EmptyState';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { DEFAULT_MIN_ATTENDANCE } from '@/constants/config';

export default function AttendanceScreen() {
  const insets = useSafeAreaInsets();
  const { classes, attendance } = useTimetable();

  const stats = useMemo(() => getAttendanceStats(classes, attendance), [classes, attendance]);

  const criticalCourses = stats.filter(s => {
    const pct = s.total > 0 ? (s.present / s.total) * 100 : 0;
    return pct < DEFAULT_MIN_ATTENDANCE && s.total > 0;
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Per-subject cards */}
        {criticalCourses.length > 0 && (
          <View style={styles.warningBanner}>
            <MaterialIcons name="warning-amber" size={18} color={Colors.warning} />
            <Text style={styles.warningText}>
              {criticalCourses.length} course{criticalCourses.length > 1 ? 's' : ''} below {DEFAULT_MIN_ATTENDANCE}% attendance
            </Text>
          </View>
        )}

        {/* Per-subject cards */}
        {stats.length === 0 ? (
          <EmptyState
            icon="assignment"
            title="No attendance data yet"
            subtitle="Mark your attendance on the Today tab to see stats here."
          />
        ) : (
          <>
            <Text style={styles.sectionTitle}>By Subject</Text>
            {stats.map(course => {
              const pct = course.total > 0 ? (course.present / course.total) * 100 : 0;
              const color = getSubjectColor(course.colorIndex);
              const isCritical = pct < DEFAULT_MIN_ATTENDANCE;

              // How many more to reach 75%
              let extraNeeded = 0;
              if (isCritical && course.total > 0) {
                extraNeeded = Math.ceil((DEFAULT_MIN_ATTENDANCE / 100 * course.total - course.present) / (1 - DEFAULT_MIN_ATTENDANCE / 100));
              }

              return (
                <View key={course.code} style={[styles.subjectCard, isCritical && styles.subjectCardCritical]}>
                  <View style={[styles.subjectColorBar, { backgroundColor: color }]} />
                  <View style={styles.subjectContent}>
                    <View style={styles.subjectHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.subjectCodeRow}>
                          <Text style={[styles.subjectCode, { color }]}>{course.code}</Text>
                          {isCritical && (
                            <View style={styles.alertChip}>
                              <MaterialIcons name="warning" size={11} color={Colors.warning} />
                              <Text style={styles.alertChipText}>LOW</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.subjectName} numberOfLines={1}>{course.name}</Text>
                      </View>
                      <AttendanceRing percentage={pct} size={60} strokeWidth={6} color={color} />
                    </View>

                    {/* Progress bar */}
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, {
                        width: `${Math.min(100, pct)}%`,
                        backgroundColor: pct >= 75 ? Colors.success : pct >= 60 ? Colors.warning : Colors.danger,
                      }]} />
                      <View style={styles.progressThreshold} />
                    </View>

                    <View style={styles.statsRow}>
                      <View style={styles.statChip}>
                        <Text style={[styles.statNum, { color: Colors.success }]}>{course.present}</Text>
                        <Text style={styles.statLabel}>Present</Text>
                      </View>
                      <View style={styles.statChip}>
                        <Text style={[styles.statNum, { color: Colors.danger }]}>{course.absent}</Text>
                        <Text style={styles.statLabel}>Absent</Text>
                      </View>
                      <View style={styles.statChip}>
                        <Text style={[styles.statNum, { color: Colors.textSecondary }]}>{course.total}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                      </View>
                    </View>

                    {isCritical && extraNeeded > 0 && (
                      <View style={styles.needBanner}>
                        <MaterialIcons name="info-outline" size={13} color={Colors.warning} />
                        <Text style={styles.needText}>
                          Attend next {extraNeeded} class{extraNeeded > 1 ? 'es' : ''} to reach 75%
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  scrollContent: { paddingHorizontal: Spacing.md, paddingBottom: 20 },

  overallCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  overallLeft: { flex: 1, gap: 4 },
  overallTitle: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  overallSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  overallBars: { marginTop: 8, gap: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  legendValue: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.semibold },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.warningDim,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  warningText: {
    fontSize: FontSize.sm,
    color: Colors.warning,
    fontWeight: FontWeight.medium,
  },

  sectionTitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  subjectCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subjectCardCritical: {
    borderColor: Colors.warning + '60',
  },
  subjectColorBar: { width: 4 },
  subjectContent: { flex: 1, padding: Spacing.md, gap: 8 },
  subjectHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  subjectCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  subjectCode: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  alertChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.warningDim,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  alertChipText: {
    fontSize: 9,
    color: Colors.warning,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  subjectName: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
    marginTop: 2,
  },

  progressTrack: {
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressThreshold: {
    position: 'absolute',
    left: '75%',
    top: -2,
    bottom: -2,
    width: 1.5,
    backgroundColor: Colors.textMuted,
  },

  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.sm,
    paddingVertical: 8,
  },
  statNum: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },

  needBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.warningDim,
    borderRadius: Radius.sm,
    padding: 8,
  },
  needText: {
    fontSize: FontSize.xs,
    color: Colors.warning,
    fontWeight: FontWeight.medium,
  },
});

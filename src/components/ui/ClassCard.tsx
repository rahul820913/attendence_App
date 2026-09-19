import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ClassEntry, AttendanceStatus } from '@/types';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { getSubjectColor, formatTime } from '@/services/timetableUtils';

interface ClassCardProps {
  cls: ClassEntry;
  status: AttendanceStatus; 
  onPresent: () => void;
  onAbsent: () => void;
  onClear: () => void; 
  onPress?: () => void;
  compact?: boolean;
}

function ClassCard({ cls, status, onPresent, onAbsent, onClear, onPress, compact }: ClassCardProps) {
  const color = getSubjectColor(cls.colorIndex);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      <View style={[styles.colorBar, { backgroundColor: color }]} />
      <View style={styles.content}>
        {/* ... Keep your existing headerRow, courseName, and metaRow ... */}
        
        <View style={styles.headerRow}>
          <View style={styles.codeChip}>
            <Text style={[styles.codeText, { color }]}>{cls.courseCode}</Text>
          </View>
          <View style={styles.timeRow}>
            <MaterialIcons name="access-time" size={13} color={Colors.textMuted} />
            <Text style={styles.timeText}>{formatTime(cls.startTime)} – {formatTime(cls.endTime)}</Text>
          </View>
        </View>

        <Text style={styles.courseName} numberOfLines={1}>{cls.courseName}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialIcons name="person-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.metaText}>{cls.facultyName}</Text>
          </View>
          {cls.room ? (
            <View style={styles.metaItem}>
              <MaterialIcons name="room" size={13} color={Colors.textMuted} />
              <Text style={styles.metaText}>{cls.room}</Text>
            </View>
          ) : null}
        </View>

        {!compact && (
          <View style={styles.actionRow}>
            <Pressable
              onPress={status === 'present' ? onClear : onPresent} 
              style={({ pressed }) => [
                styles.actionBtn,
                styles.presentBtn,
                status === 'present' && styles.presentActive,
                pressed && { opacity: 0.75 },
              ]}
            >
              <MaterialIcons
                name="check-circle"
                size={15}
                color={status === 'present' ? '#fff' : Colors.success}
              />
              <Text style={[
                styles.actionBtnText,
                { color: status === 'present' ? '#fff' : Colors.success }
              ]}>Present</Text>
            </Pressable>

            <Pressable
              onPress={status === 'absent' ? onClear : onAbsent}
              style={({ pressed }) => [
                styles.actionBtn,
                styles.absentBtn,
                status === 'absent' && styles.absentActive,
                pressed && { opacity: 0.75 },
              ]}
            >
              <MaterialIcons
                name="cancel"
                size={15}
                color={status === 'absent' ? '#fff' : Colors.danger}
              />
              <Text style={[
                styles.actionBtnText,
                { color: status === 'absent' ? '#fff' : Colors.danger }
              ]}>Absent</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default memo(ClassCard);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  colorBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeChip: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  codeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  courseName: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  actionBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  presentBtn: {
    borderColor: Colors.success,
    backgroundColor: Colors.successDim,
  },
  presentActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  absentBtn: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerDim,
  },
  absentActive: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
});

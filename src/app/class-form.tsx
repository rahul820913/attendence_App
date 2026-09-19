// Powered by OnSpace.AI
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Switch,
  KeyboardAvoidingView, Platform, FlatList, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTimetable } from '@/hooks/useTimetable';
import { getSubjectColor } from '@/services/timetableUtils';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { DAYS } from '@/constants/config';
import { useAlert } from '@/template';
import { ClassEntry } from '@/types';

const COLOR_INDICES = [0, 1, 2, 3, 4, 5, 6, 7];
const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const ITEM_HEIGHT = 44;

// ─── Wheel Picker ──────────────────────────────────────────────────────────
function WheelColumn({ items, selected, onChange }: {
  items: string[];
  selected: string;
  onChange: (v: string) => void;
}) {
  const flatRef = useRef<FlatList<string>>(null);
  const selectedIndex = items.indexOf(selected);

  useEffect(() => {
    if (flatRef.current && selectedIndex >= 0) {
      setTimeout(() => {
        flatRef.current?.scrollToIndex({ index: selectedIndex, animated: false, viewPosition: 0.5 });
      }, 50);
    }
  }, []);

  const handleMomentumEnd = (e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    onChange(items[clamped]);
  };

  return (
    <FlatList
      ref={flatRef}
      data={items}
      keyExtractor={item => item}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      onMomentumScrollEnd={handleMomentumEnd}
      getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
      style={wheelStyles.column}
      contentContainerStyle={{
        paddingVertical: ITEM_HEIGHT * 2,
      }}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => {
            const idx = items.indexOf(item);
            flatRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
            onChange(item);
          }}
          style={[wheelStyles.item, item === selected && wheelStyles.itemSelected]}
        >
          <Text style={[wheelStyles.itemText, item === selected && wheelStyles.itemTextSelected]}>
            {item}
          </Text>
        </Pressable>
      )}
    />
  );
}

const wheelStyles = StyleSheet.create({
  column: {
    width: 64,
    height: ITEM_HEIGHT * 5,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
  },
  itemSelected: {
    backgroundColor: Colors.primary,
  },
  itemText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  itemTextSelected: {
    color: '#fff',
    fontWeight: FontWeight.bold,
    fontSize: FontSize.lg,
  },
});

// ─── Time Picker Modal ───────────────────────────────────────────────────────
function TimePickerModal({ visible, value, onClose, onConfirm, label }: {
  visible: boolean;
  value: string;
  onClose: () => void;
  onConfirm: (t: string) => void;
  label: string;
}) {
  const [h, m] = value.split(':');
  const [selH, setSelH] = useState(h || '09');
  const [selM, setSelM] = useState(m || '00');

  useEffect(() => {
    const [hh, mm] = value.split(':');
    setSelH(hh || '09');
    setSelM(mm || '00');
  }, [value, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={modalStyles.backdrop} onPress={onClose}>
        <Pressable style={modalStyles.sheet} onPress={e => e.stopPropagation()}>
          <Text style={modalStyles.title}>{label}</Text>

          <View style={modalStyles.wheelsRow}>
            {/* Highlight band */}
            <View style={modalStyles.highlightBand} pointerEvents="none" />

            <WheelColumn items={HOURS} selected={selH} onChange={setSelH} />
            <Text style={modalStyles.colon}>:</Text>
            <WheelColumn items={MINUTES} selected={selM} onChange={setSelM} />
          </View>

          <View style={modalStyles.actions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [modalStyles.btn, pressed && { opacity: 0.7 }]}
            >
              <Text style={modalStyles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => onConfirm(`${selH}:${selM}`)}
              style={({ pressed }) => [modalStyles.btn, modalStyles.confirmBtn, pressed && { opacity: 0.8 }]}
            >
              <Text style={modalStyles.confirmText}>Confirm</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
  },
  wheelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  highlightBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary + '60',
    backgroundColor: Colors.primaryDim + '40',
    zIndex: 0,
  },
  colon: {
    fontSize: 24,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
    paddingHorizontal: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.md,
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
  },
  cancelText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
  },
  confirmText: {
    fontSize: FontSize.base,
    color: '#fff',
    fontWeight: FontWeight.semibold,
  },
});

// ─── Main Form ───────────────────────────────────────────────────────────────
export default function ClassFormScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { editId, dayIndex } = useLocalSearchParams<{ editId?: string; dayIndex?: string }>();
  const { classes, addClass, updateClass, deleteClass } = useTimetable();

  const editClass = useMemo(() => editId ? classes.find(c => c.id === editId) : null, [editId, classes]);
  const isEdit = !!editClass;

  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [room, setRoom] = useState('');
  const [day, setDay] = useState(dayIndex ? parseInt(dayIndex) : 0);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [colorIndex, setColorIndex] = useState(0);
  const [isExtra, setIsExtra] = useState(false);
  const [extraDate, setExtraDate] = useState('');

  const [startPickerVisible, setStartPickerVisible] = useState(false);
  const [endPickerVisible, setEndPickerVisible] = useState(false);

  useEffect(() => {
    if (editClass) {
      setCourseCode(editClass.courseCode);
      setCourseName(editClass.courseName);
      setFacultyName(editClass.facultyName);
      setRoom(editClass.room || '');
      setDay(editClass.day);
      setStartTime(editClass.startTime);
      setEndTime(editClass.endTime);
      setColorIndex(editClass.colorIndex);
      setIsExtra(editClass.isExtra || false);
      setExtraDate(editClass.extraDate || '');
    }
  }, [editClass]);

  const validate = (): string | null => {
    if (!courseCode.trim()) return 'Course code is required';
    if (!courseName.trim()) return 'Course name is required';
    if (!facultyName.trim()) return 'Faculty name is required';
    if (startTime >= endTime) return 'Start time must be before end time';
    if (isExtra && !extraDate) return 'Date required for extra class (YYYY-MM-DD)';
    return null;
  };

  const handleSave = () => {
    const error = validate();
    if (error) { showAlert('Validation Error', error); return; }

    const data: Omit<ClassEntry, 'id'> = {
      courseCode: courseCode.trim().toUpperCase(),
      courseName: courseName.trim(),
      facultyName: facultyName.trim(),
      room: room.trim() || undefined,
      day,
      startTime,
      endTime,
      colorIndex,
      isExtra,
      extraDate: isExtra ? extraDate : undefined,
    };

    if (isEdit && editId) {
      updateClass(editId, data);
    } else {
      addClass(data);
    }
    router.back();
  };

  const handleDelete = () => {
    showAlert('Delete Class', 'Are you sure you want to delete this class?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteClass(editId!); router.back(); } },
    ]);
  };

  const formatDisplay = (t: string) => {
    const [hStr, mStr] = t.split(':');
    const h = parseInt(hStr);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${mStr} ${ampm}`;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={({ pressed }) => pressed && { opacity: 0.6 }}>
            <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
          </Pressable>
          <Text style={styles.headerTitle}>{isEdit ? 'Edit Class' : 'Add Class'}</Text>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Color Picker */}
          <Text style={styles.label}>Subject Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
            <View style={styles.colorRow}>
              {COLOR_INDICES.map(idx => {
                const c = getSubjectColor(idx);
                return (
                  <Pressable
                    key={idx}
                    onPress={() => setColorIndex(idx)}
                    style={({ pressed }) => [
                      styles.colorDot,
                      { backgroundColor: c },
                      colorIndex === idx && styles.colorDotSelected,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    {colorIndex === idx && <MaterialIcons name="check" size={16} color="#fff" />}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Fields */}
          <Field label="Course Code *" value={courseCode} onChangeText={setCourseCode}
            placeholder="e.g. CS301" autoCapitalize="characters" />
          <Field label="Course Name *" value={courseName} onChangeText={setCourseName}
            placeholder="e.g. Data Structures" />
          <Field label="Faculty Name *" value={facultyName} onChangeText={setFacultyName}
            placeholder="e.g. Dr. Sharma" />
          <Field label="Room / Location" value={room} onChangeText={setRoom}
            placeholder="e.g. A-101, Lab-2" />

          {/* Day Picker */}
          <Text style={styles.label}>Day</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
            <View style={styles.dayRow}>
              {DAYS.map((d, i) => (
                <Pressable
                  key={d}
                  onPress={() => setDay(i)}
                  style={({ pressed }) => [
                    styles.dayPill,
                    day === i && styles.dayPillSelected,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={[styles.dayPillText, day === i && styles.dayPillTextSelected]}>
                    {d.slice(0, 3)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Time Picker Buttons */}
          <View style={styles.timeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Start Time *</Text>
              <Pressable
                onPress={() => setStartPickerVisible(true)}
                style={({ pressed }) => [styles.timeTrigger, pressed && { opacity: 0.8 }]}
              >
                <MaterialIcons name="schedule" size={18} color={Colors.primary} />
                <Text style={styles.timeValue}>{formatDisplay(startTime)}</Text>
                <MaterialIcons name="expand-more" size={18} color={Colors.textMuted} />
              </Pressable>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>End Time *</Text>
              <Pressable
                onPress={() => setEndPickerVisible(true)}
                style={({ pressed }) => [styles.timeTrigger, pressed && { opacity: 0.8 }]}
              >
                <MaterialIcons name="schedule" size={18} color={Colors.primary} />
                <Text style={styles.timeValue}>{formatDisplay(endTime)}</Text>
                <MaterialIcons name="expand-more" size={18} color={Colors.textMuted} />
              </Pressable>
            </View>
          </View>

          {/* Extra class toggle */}
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.label}>Extra / One-off Class</Text>
              <Text style={styles.toggleSub}>Appears only on the specified date</Text>
            </View>
            <Switch
              value={isExtra}
              onValueChange={setIsExtra}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {isExtra && (
            <Field label="Class Date *" value={extraDate} onChangeText={setExtraDate}
              placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" />
          )}

          {isEdit && (
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.75 }]}
            >
              <MaterialIcons name="delete-outline" size={18} color={Colors.danger} />
              <Text style={styles.deleteBtnText}>Delete this class</Text>
            </Pressable>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Time Picker Modals */}
      <TimePickerModal
        visible={startPickerVisible}
        value={startTime}
        label="Select Start Time"
        onClose={() => setStartPickerVisible(false)}
        onConfirm={t => { setStartTime(t); setStartPickerVisible(false); }}
      />
      <TimePickerModal
        visible={endPickerVisible}
        value={endTime}
        label="Select End Time"
        onClose={() => setEndPickerVisible(false)}
        onConfirm={t => { setEndTime(t); setEndPickerVisible(false); }}
      />
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChangeText, placeholder, autoCapitalize, keyboardType }: {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; autoCapitalize?: any; keyboardType?: any;
}) {
  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={fieldStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        autoCapitalize={autoCapitalize || 'words'}
        keyboardType={keyboardType || 'default'}
        selectionColor={Colors.primary}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  saveBtnText: {
    fontSize: FontSize.base,
    color: '#fff',
    fontWeight: FontWeight.semibold,
  },
  scrollContent: { padding: Spacing.md },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    marginBottom: 8,
  },
  colorRow: { flexDirection: 'row', gap: Spacing.sm, paddingRight: Spacing.md },
  colorDot: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  dayRow: { flexDirection: 'row', gap: 6, paddingRight: Spacing.md },
  dayPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayPillText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  dayPillTextSelected: { color: '#fff', fontWeight: FontWeight.semibold },
  timeRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  timeTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary + '60',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  timeValue: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  toggleSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.danger + '60',
    backgroundColor: Colors.dangerDim,
    marginTop: Spacing.md,
  },
  deleteBtnText: {
    fontSize: FontSize.base,
    color: Colors.danger,
    fontWeight: FontWeight.semibold,
  },
});

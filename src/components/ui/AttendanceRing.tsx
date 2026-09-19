// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, FontSize, FontWeight } from '@/constants/theme';

interface AttendanceRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}

function AttendanceRing({ percentage, size = 72, strokeWidth = 7, color }: AttendanceRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const ringColor = percentage >= 75 ? Colors.success : percentage >= 60 ? Colors.warning : Colors.danger;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.label}>
        <Text style={[styles.percent, { color: ringColor }]}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
}

export default memo(AttendanceRing);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    position: 'absolute',
    alignItems: 'center',
  },
  percent: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});

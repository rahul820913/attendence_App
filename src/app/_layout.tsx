// Powered by OnSpace.AI
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';
import { TimetableProvider } from '@/contexts/TimetableContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <TimetableProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="class-form"
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
          </Stack>
        </TimetableProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}

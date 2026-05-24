import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { MenuProvider } from '@/contexts/MenuContext';
import { MesaProvider } from '@/contexts/MesaContext';

export default function RootLayout() {
  useFrameworkReady();
  
  return (
    <>
      <MesaProvider>
        <MenuProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </MenuProvider>
      </MesaProvider>
      <StatusBar style="auto" />
    </>
  );
}
import { Tabs } from "expo-router";
import {
  ShoppingBag,
  Utensils,
  ClipboardList, Users
} from 'lucide-react-native';

export default function TabsLayout() {
  
   return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="client"
        options={{
          title: "Cardápio",
          tabBarIcon: ({ color, size }) => (
            <ShoppingBag color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="restaurant"
        options={{
          title: "Gerenciar",
          tabBarIcon: ({ color, size }) => (
            <Utensils color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="order"
        options={{
          tabBarIcon: ({ color, size }) => (
            <ClipboardList color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Mesas"
        options={{
          title: "Status Mesa",
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={size} />
          ),
        }}
      />
    </Tabs>
   );

}
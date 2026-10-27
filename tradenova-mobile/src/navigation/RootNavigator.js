import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import WatchScreen from '../screens/WatchScreen';
import TerminalScreen from '../screens/TerminalScreen';
import PositionsScreen from '../screens/PositionsScreen';
import OrdersScreen from '../screens/OrdersScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { COLORS } from '../theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, label, focused }) {
  const icons = {
    Watch: '📊',
    Terminal: '📈',
    Positions: '💼',
    Orders: '📝',
    Dashboard: '⚡',
    Profile: '👤',
  };

  return (
    <View style={styles.tabIconBox}>
      <Text style={[styles.tabIconEmoji, focused && styles.tabIconEmojiFocused]}>
        {icons[name] || '•'}
      </Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
        {label}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.bgPrimary,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.borderPrimary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: COLORS.textPrimary,
          fontWeight: '900',
          fontSize: 17,
        },
        tabBarStyle: {
          backgroundColor: COLORS.bgSecondary,
          borderTopWidth: 1,
          borderTopColor: COLORS.borderPrimary,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Watch"
        component={WatchScreen}
        options={{
          title: 'TradeNova Market Watch',
          tabBarIcon: ({ focused }) => <TabIcon name="Watch" label="Watch" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Terminal"
        component={TerminalScreen}
        options={{
          title: 'Trading Terminal',
          tabBarIcon: ({ focused }) => <TabIcon name="Terminal" label="Terminal" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Positions"
        component={PositionsScreen}
        options={{
          title: 'Active Positions (M2M)',
          tabBarIcon: ({ focused }) => <TabIcon name="Positions" label="Positions" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: 'Order Book Ledger',
          tabBarIcon: ({ focused }) => <TabIcon name="Orders" label="Orders" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Trader Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon name="Dashboard" label="Dashboard" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Trader Account',
          tabBarIcon: ({ focused }) => <TabIcon name="Profile" label="Account" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconEmoji: {
    fontSize: 18,
    opacity: 0.6,
  },
  tabIconEmojiFocused: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  tabLabelFocused: {
    color: COLORS.gold,
  },
});

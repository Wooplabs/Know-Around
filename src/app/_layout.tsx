import { Tabs } from 'expo-router';
import { useColorScheme, Platform, StyleSheet, View, Pressable, Text } from 'react-native';
import { KnowAroundProvider, useKnowAround } from '@/context/KnowAroundContext';
import { Colors } from '@/constants/theme';
import OnboardingModal from '@/components/OnboardingModal';
import AuthScreen from '@/components/AuthScreen';
import PostComposerModal from '@/components/PostComposerModal';
import { Ionicons } from '@expo/vector-icons';
import { HomeIcon, MapIcon, ChatsIcon } from '@/components/CustomIcons';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { setComposerVisible, darkMode } = useKnowAround();

  return (
    <View style={styles.tabBarWrapper} pointerEvents="box-none">
      {/* Side-by-Side Floating Bar Container */}
      <View style={styles.tabBarRow} pointerEvents="box-none">
        
        {/* Left White Tabs Capsule */}
        <View style={[styles.floatingTabBar, { backgroundColor: darkMode ? '#1C1C1E' : '#ffffff' }]}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            
            let label = 'Home';
            if (route.name === 'search') label = 'Search';
            else if (route.name === 'directory') label = 'Connect';

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const color = isFocused 
              ? '#3AA832' 
              : (darkMode ? '#B0BEC5' : '#37474F');

            // Custom icon selector for premium look
            const renderIcon = () => {
              if (route.name === 'index') {
                return <HomeIcon color={color} size={24} />;
              } else if (route.name === 'search') {
                return <MapIcon color={color} size={24} />;
              } else {
                return <ChatsIcon color={color} size={24} />;
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={[styles.tabBarItem, { opacity: isFocused ? 1 : 0.5 }]}
              >
                {renderIcon()}
                <Text style={[styles.tabBarLabel, { color }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Right Green FAB Button */}
        <Pressable style={styles.fabBtn} onPress={() => setComposerVisible(true)}>
          <Ionicons name="add" size={32} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}

function MainLayout() {
  const { user } = useKnowAround();

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBar: (props) => <CustomTabBar {...props} />,
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="search" />
        <Tabs.Screen name="directory" />
      </Tabs>
      <OnboardingModal />
      <PostComposerModal />
    </View>
  );
}

export default function RootLayout() {
  return (
    <KnowAroundProvider>
      <MainLayout />
    </KnowAroundProvider>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 99,
  },
  tabBarRow: {
    width: '100%',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  floatingTabBar: {
    width: 236, // Fixed width to prevent stretching and match mockup proportions
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 34, // Perfect round pill curvature
    height: 68,       // Increased height to match design
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 34, // Pulls left/right icons inwards for closer spacing
    
    // Smooth spread shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  tabBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  fabBtn: {
    width: 68,        // Match capsule height
    height: 68,       // Match capsule height
    borderRadius: 34, // Full curve like round
    backgroundColor: '#37474F', // Blue Grey color
    alignItems: 'center',
    justifyContent: 'center',
    
    // Soft shadow matching FAB color
    shadowColor: '#37474F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
});

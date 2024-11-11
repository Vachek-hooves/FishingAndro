import React, {useState, useEffect, useRef} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {AppProvider} from './store/context';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import AntIcon from 'react-native-vector-icons/AntDesign';
import {
  TabMapScreen,
  WelcomeScreen,
  TabMoonScreen,
  TabWeatherScreen,
  TabSpotsScreen,
  TabUserScreen,
} from './screen';
import LinearGradient from 'react-native-linear-gradient';
import {
  View,
  AppState,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
} from 'react-native';
import {
  setupPlayer,
  playBackgroundMusic,
  pauseBackgroundMusic,
  toggleBackgroundMusic,
} from './components/sound/setPlayer';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 1000,
          }}>
          <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}

export default App;

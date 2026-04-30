import React from 'react';
import { GameProvider } from './context/GameContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './services/navigationRef';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Login from './pages/Login';
import SignUp from './pages/SignUp';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import RouteModePage from './pages/RouteModePage';
import PartyModePage from './pages/PartyModePage';
import CreatePartyPage from './pages/CreatePartyPage';
import PartyLobbyPage from './pages/PartyLobbyPage';
import PartyOwnerPage from './pages/PartyOwnerPage';
import YourRolePage from './pages/YourRolePage';
import SettingsPage from './pages/SettingsPage';
import MapPage from './pages/MapPage';
import QuizCountdownPage from './pages/QuizCountdownPage';
import QuizPage from './pages/QuizPage';
import QuizResultPage from './pages/QuizResultPage';
import SensorDataPage from './pages/SensorDataPage';
import GameSetupPage from './pages/GameSetupPage';
import CameraPage from './pages/Camera';
import ImageUploadScreenPage from './pages/ImageUploadScreen';
import UserPhoto from './pages/UserPhoto';
import LeaderboardPage from './pages/LeaderboardPage';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AccessibilityProvider>
      <GameProvider>
        <SafeAreaProvider>
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false, animation: 'none' }}>
              <Stack.Screen name="Login"       component={Login} />
              <Stack.Screen name="SignUp"      component={SignUp} />
              <Stack.Screen name="Home"        component={HomePage} />
              <Stack.Screen name="Profile"     component={ProfilePage} />
              <Stack.Screen name="EditProfile" component={EditProfilePage} />
              <Stack.Screen name="RouteMode"   component={RouteModePage} />
              <Stack.Screen name="PartyMode"   component={PartyModePage} />
              <Stack.Screen name="CreateParty" component={CreatePartyPage} />
              <Stack.Screen name="PartyLobby"  component={PartyLobbyPage} />
              <Stack.Screen name="PartyOwner"  component={PartyOwnerPage} />
              <Stack.Screen name="YourRole"    component={YourRolePage} />
              <Stack.Screen name="Settings"    component={SettingsPage} />
              <Stack.Screen name="Map"         component={MapPage} />
              <Stack.Screen name="QuizCountdown" component={QuizCountdownPage} />
              <Stack.Screen name="Quiz"          component={QuizPage} />
              <Stack.Screen name="QuizResult"    component={QuizResultPage} />
              <Stack.Screen name="SensorData"    component={SensorDataPage} />
              <Stack.Screen name="GameSetup"     component={GameSetupPage} />
              <Stack.Screen name="Camera"        component={CameraPage} />
              <Stack.Screen name="ImageUpload"   component={ImageUploadScreenPage} />
              <Stack.Screen name="UserPhoto"     component={UserPhoto} />
              <Stack.Screen name="Leaderboard"   component={LeaderboardPage} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </GameProvider>
    </AccessibilityProvider>
  );
}

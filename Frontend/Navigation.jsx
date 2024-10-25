import React, { createContext, useState, useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, Platform } from 'react-native';
import Home from './components/Home';
import Play from './components/Play';
import Practice from './components/Practice';
import Settings from './components/Settings';
import Store from './components/Store';
import Profile from './components/Profile';
import Categories from './components/Categories';
import Leaderboard from './components/Leaderboard';
import Login from './components/Login';
import Register from './components/Register';

const AuthContext = createContext();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const getTabBarIcon = (route, color, size) => {
  const icons = {
    Store: 'storefront',
    Profile: 'person',
    Categories: 'apps',
    Leaderboard: 'list',
    HomeTab: 'globe',
  };

  const iconName = icons[route.name] || 'home';
  return <Ionicons name={iconName} size={route.name === 'HomeTab' ? 34 : size} color={color} />;
};

// Navegación de autenticación
const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
};
// Header de navegación navegar
const CustomHeader = ({ navigation }) => (
  <View style={{ 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: Platform.OS === 'android' ? 35 : 0,
    paddingHorizontal: 15,
    backgroundColor: '#89e3f7' 
  }}>
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back" size={28} color="#083142" />
    </TouchableOpacity>
  </View>
);

// Navegación principal (pestañas)
const HomeStack = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="Play" component={Play} options={{ headerShown: false }}/>
       <Stack.Screen
        name="Practice"
        component={Practice}
        options={({ navigation }) => ({
          header: () => <CustomHeader navigation={navigation} />, 
        })}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={({ navigation }) => ({
          header: () => <CustomHeader navigation={navigation} />,
        })}
      />
    </Stack.Navigator>
  );
};

// Navegación de tabs principales
const MainTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => getTabBarIcon(route, color, size),
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: 'white' },
      })}
    >
      <Tab.Screen name="Store" component={Store} options={{ headerShown: false }} />
      <Tab.Screen name="Categories" component={Categories} options={{ headerShown: false }} />
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={({ route }) => ({
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarStyle: {
            display: route.state?.routes.some(r => r.name === 'Play' || r.name === 'Practice') ? 'none' : 'flex',
          },
        })}
      />
      <Tab.Screen name="Leaderboard" component={Leaderboard} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};


const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => setIsAuthenticated(true);
  const logout = async () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


const Navigation = () => {
  const { isAuthenticated } = useContext(AuthContext); 

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export { AuthProvider, Navigation, AuthContext };
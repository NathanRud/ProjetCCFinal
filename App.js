import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import game from "./screens/game";
import login from "./screens/login";
import meilleurs_scores from "./screens/meilleurs_scores";


const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
    <Stack.Navigator initialRouteName='login'>
      <Stack.Screen
          name="login"
          component={login}
           options={{ headerShown: false }} 
      />
        <Stack.Screen
            name="game"
            component={game}
             options={{ headerShown: false }} 
        />
        <Stack.Screen
            name="meilleurs_scores"
            component={meilleurs_scores}
           
        />
    
    </Stack.Navigator>
</NavigationContainer>
  );
};


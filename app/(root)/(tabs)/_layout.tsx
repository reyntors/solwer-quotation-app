import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, Image } from 'react-native';

import icons from '@/constants/icons'




type TabIconProps = {
  focused: boolean;
  icon: any;
  title: string;
};

const TabIcon = ({ focused, icon, title }: TabIconProps) => (
  <View className="flex-1 mt-3 flex-col items-center">
    <Image
      source={icon}
      tintColor={focused ? '#0061ff' : '#666876'}
      resizeMode="contain"
      className="size-6"
    />
    <Text className={`${focused? 'text-primary-300 font-rubik-medium': 'text-black-200 font-rubik'} text-xs w-full text-center mt-1`}>
    {title}
    </Text>
  </View>
);

const TabsLayout = () => {
  return (
    <Tabs
        screenOptions={{
            tabBarShowLabel: false,
            tabBarStyle: {
                backgroundColor: 'white',
                position: 'absolute',
                borderTopColor: '#0061FF1A',
                borderTopWidth: 1,
                minHeight: 70,
            }
        }}
    >
      <Tabs.Screen
      name='index'
      options={{
        title: 'Home',
        headerShown: false,
        tabBarIcon: ({focused}) => (
            <TabIcon icon={icons.home}
            focused = {focused} title="Home"
            />
        )
      }}
      />
       <Tabs.Screen
      name='estimate'
      options={{
        title: 'Estimate',
        headerShown: false,
        tabBarIcon: ({focused}) => (
            <TabIcon icon={icons.calculator}
            focused = {focused} title="Estimate"
            />
        )
      }}
      />
       <Tabs.Screen
      name='tools'
      options={{
        title: 'Tools',
        headerShown: false,
        tabBarIcon: ({focused}) => (
            <TabIcon icon={icons.support}
            focused = {focused} title="Tools"
            />
        )
      }}
      />
      <Tabs.Screen
      name='solwerQuotation'
      options={{
        title: 'solwerQuotation',
        headerShown: false,
        tabBarIcon: ({focused}) => (
            <TabIcon icon={icons.quotation}
            focused = {focused} title="Quotation"
            />
        )
      }}
      />

      <Tabs.Screen
      name='profile'
      options={{
        title: 'Profile',
        headerShown: false,
        tabBarIcon: ({focused}) => (
            <TabIcon icon={icons.person}
            focused = {focused} title="Profile"
            />
        )
      }}
      />
      

      
      
      
      
    </Tabs>
    
  );
};



export default TabsLayout;
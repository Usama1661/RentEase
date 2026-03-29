import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { useNavigation } from '@react-navigation/native';

const Onboardingscreen = () => {
  const navigation = useNavigation();

  const handleSkip = () => {
    navigation.navigate('Signup');
  };

  return (
    <Onboarding
      onSkip={handleSkip}
      onDone={() => navigation.navigate('Signup')}
      pages={[
        {
          backgroundColor: 'black',
          image: <Image source={require('../images/logo.png')} style={{ height: '60%', width: '100%', top: 100 }} />,
          title: <Text style={{ fontSize: 24, color: 'orange', fontWeight: 'bold', bottom: 50 }}>Welcome</Text>,
          subtitle: (
            <Text style={{ fontSize: 16, color: 'white', textAlign: 'center', bottom: 50 }}>
              Discover the power of our platform, where you can rent, buy, sell, and book assets seamlessly.
            </Text>
          ),
        },
        {
          backgroundColor: 'black',
          image: <Image source={require('../images/buysell.png')} style={{ height: '60%', width: '60%', top: 100 }} />,
          title: <Text style={{ fontSize: 24, color: '#05c6a1', fontWeight: 'bold', bottom: 50 }}>Buy & Sell</Text>,
          subtitle: (
            <Text style={{ fontSize: 16, color: 'white', textAlign: 'center', bottom: 50 }}>
              Explore a marketplace where you can buy and sell a wide variety of products and services.
            </Text>
          ),
        },
        {
          backgroundColor: 'black',
          image: <Image source={require('../images/renting.png')} style={{ height: '60%', width: '60%', top: 100 }} />,
          title: <Text style={{ fontSize: 24, color: 'red', fontWeight: 'bold', bottom: 50 }}>Renting Made Easy</Text>,
          subtitle: (
            <Text style={{ fontSize: 16, color: 'white', textAlign: 'center', bottom: 50 }}>
              Renting has never been easier. Explore a variety of rental options and secure your ideal space with confidence.
            </Text>
          ),
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#white', // Changed to '#FFF' or any valid color
  },
});

export default Onboardingscreen;


import { StyleSheet, Text, View, Dimensions, ImageBackground, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'
import LottieView from 'lottie-react-native'
import { useNavigation } from '@react-navigation/native';
import MainLayout from '../components/appLayout/MainLayout';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.ValueXY({ x: -width, y: height/2 })).current;

  useEffect(() => {
    Animated.sequence([
      // First move from left to center
      Animated.spring(slideAnim, {
        toValue: { x: 0, y: height/2 },
        useNativeDriver: true,
        tension: 50,
        friction: 7
      }),
      // Then move higher to top
      Animated.timing(slideAnim, {
        toValue: { x: 0, y: height * 0.05-200 },
        duration: 1500,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Navigate to TabScreens after 1 second of animation completion
      setTimeout(() => {
        navigation.replace('TabScreens');
      }, 1000);
    });
  }, []);

  return (
    <MainLayout styles={{alignItems:'center',justifyContent:'center'}}>
        {/* <ImageBackground style={styles.container} source={require('../assets/bg.png')}> */}

      <View style={styles.animationContainer}>
        <LottieView
          source={require('../assets/lottieJson/fisherman.json')}
          autoPlay
          loop
          style={styles.animation}
          resizeMode="cover"
          />
      </View>
      <Animated.Text 
        style={[
          styles.welcomeText,
          {
            transform: [
              { translateX: slideAnim.x },
              { translateY: slideAnim.y }
            ]
          }
        ]}
        >
        Welcome{'\n'}to{'\n'}
        <Text style={{ fontSize: 42, color: '#FFD700' }}>
          Ultimate{'\n'}Fishing Diary
        </Text>
      </Animated.Text>
    {/* </ImageBackground> */}
        </MainLayout>
  )
}

export default WelcomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationContainer: {
    position: 'absolute',
    top: height * 0.3,
  },
  animation: {
    width: width,
    height: height * 0.4,
    transform: [
      { scaleX: -1 }  // This will flip the animation horizontally
    ]
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -2, height: 2 },
    textShadowRadius: 15,
    
    elevation: 5,
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    
    position: 'absolute',
    paddingHorizontal: 20,
    width: width * 0.9,
  }
})
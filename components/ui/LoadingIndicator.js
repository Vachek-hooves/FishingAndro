import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const LoadingIndicator = () => {
    const spinValue = new Animated.Value(0);

    React.useEffect(() => {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }, []);
  
    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
  
    return (
      <View style={styles.container}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Icon name="loader" size={60} color="#0066ff" />
        </Animated.View>
      </View>
    );
}

export default LoadingIndicator

const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
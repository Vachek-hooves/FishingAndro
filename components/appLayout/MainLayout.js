import {ImageBackground, StyleSheet, Text, View} from 'react-native';

const MainLayout = ({children,styles}) => {
  return (
    <ImageBackground
      style={[styles,{flex: 1}]}
      source={require('../../assets/bg/bg.png')}>
      {children}
    </ImageBackground>
  );
};

export default MainLayout;

const styles = StyleSheet.create({});

import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/AntDesign';

const SetSoundIcon = ({isMusicPlay}) => {
  return (
    <View>
      <Icon name="sound" color={isMusicPlay ? 'red' : 'green'} size={40} />
    </View>
  )
}

export default SetSoundIcon

const styles = StyleSheet.create({})
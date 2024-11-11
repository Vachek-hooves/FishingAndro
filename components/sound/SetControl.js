import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import SetSoundIcon from './SetSoundIcon';
import {toggleBackgroundMusic, setupPlayer} from './setPlayer';

const SetControl = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    try {
      setupPlayer();
    } catch (error) {
      console.error('Error setting up sound:', error);
    }
  }, []);

  const handleSoundToggle = () => {
    try {
      const newPlayingState = toggleBackgroundMusic();
      setIsPlaying(newPlayingState);
    } catch (error) {
      console.error('Error toggling sound:', error);
    }
  };
  
  return (
    <View>
      <SetSoundIcon isMusicPlay={isPlaying} />
    </View>
  );
};

export default SetControl;

const styles = StyleSheet.create({});

import Sound from 'react-native-sound';

let backgroundMusic = null;
let isPlaying = false;

export const setupPlayer = () => {
  if (backgroundMusic) return; // Prevent multiple initializations

  Sound.setCategory('Playback');
  
  return new Promise((resolve, reject) => {
    backgroundMusic = new Sound(
      require('../../assets/bgMusic.mp3'), 
      (error) => {
        if (error) {
          console.error('Failed to load sound', error);
          reject(error);
          return;
        }
        backgroundMusic.setNumberOfLoops(-1);
        backgroundMusic.setVolume(0.5);
        resolve();
      }
    );
  });
};

export const playBackgroundMusic = async () => {
  if (!backgroundMusic) {
    await setupPlayer();
  }
  
  if (!isPlaying && backgroundMusic) {
    backgroundMusic.play((success) => {
      if (!success) {
        console.log('Playback failed due to audio decoding errors');
      }
    });
    isPlaying = true;
  }
};

export const pauseBackgroundMusic = () => {
  if (backgroundMusic && isPlaying) {
    backgroundMusic.pause();
    isPlaying = false;
  }
};

export const toggleBackgroundMusic = () => {
  if (!backgroundMusic) {
    setupPlayer();
    return true;
  }

  if (isPlaying) {
    pauseBackgroundMusic();
    return false;
  } else {
    playBackgroundMusic();
    return true;
  }
};

export const cleanupPlayer = () => {
  if (backgroundMusic) {
    backgroundMusic.release();
    backgroundMusic = null;
    isPlaying = false;
  }
};

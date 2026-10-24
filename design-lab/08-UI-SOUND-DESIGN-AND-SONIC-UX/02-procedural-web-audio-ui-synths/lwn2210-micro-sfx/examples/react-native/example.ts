import { sfx } from 'micro-sfx';
// In React Native / Expo:
// import { Audio } from 'expo-av';
// or import Sound from 'react-native-sound';

/**
 * React Native / Expo Example: Playing procedural sound via Data URI
 * No static audio files needed in assets/ !
 */
export async function playSoundInReactNative(preset: 'coin' | 'jump' | 'laser' | 'click' | 'explosion') {
  // 1. Generate on-the-fly base64 data URI
  const soundUri = sfx.toDataURI(preset);

  console.log(`Generated zero-asset data URI for '${preset}':`, soundUri.slice(0, 50) + '...');

  // Example with expo-av:
  // const { sound } = await Audio.Sound.createAsync({ uri: soundUri });
  // await sound.playAsync();

  // Example with react-native-sound:
  // const s = new Sound(soundUri, '', (error) => {
  //   if (!error) s.play();
  // });

  return soundUri;
}

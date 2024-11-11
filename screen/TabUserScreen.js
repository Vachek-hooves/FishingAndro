import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'react-native-image-picker';
import MainLayout from '../components/appLayout/MainLayout';

const TabUserScreen = () => {
  const [user, setUser] = useState({
    name: '',
    image: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExistingUser, setIsExistingUser] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUser(parsedData);
        setIsExistingUser(true);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserData = async () => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      Alert.alert('Success', 'User data saved successfully!');
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Failed to save user data');
    }
  };

  const selectImage = () => {
    const options = {
      maxWidth: 2000,
      maxHeight: 2000,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error:', response.error);
      } else {
        const source = {uri: response.assets[0].uri};
        setUser(prevUser => ({
          ...prevUser,
          image: source.uri,
        }));
      }
    });
  };

  const deleteImage = () => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to remove your profile photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setUser(prevUser => ({
              ...prevUser,
              image: null,
            }));
          },
        },
      ],
    );
  };

  if (isLoading) {
    return <View style={styles.loadingContainer}></View>;
  }

  return (
    <MainLayout>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}>
          {/* <LinearGradient
            colors={['#003366', '#001f3f', '#000']}
            style={styles.container}> */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}>
            {isExistingUser && (
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>
                  Welcome back, {user.name}!
                </Text>
                {/* <LottieView
                  source={require('../assets/lottieJson/welcome.json')}
                  autoPlay
                  loop
                  style={styles.welcomeAnimation}
                  /> */}
              </View>
            )}

            <View style={styles.headerContainer}>
              <TouchableOpacity
                onPress={selectImage}
                style={styles.imageContainer}>
                {user.image ? (
                  <>
                    <Image
                      source={{uri: user.image}}
                      style={styles.profileImage}
                    />
                    <View style={styles.editIconContainer}>
                      <Icon name="pencil" size={16} color="#fff" />
                    </View>
                    <TouchableOpacity
                      style={styles.deleteImageButton}
                      onPress={deleteImage}>
                      <Icon name="trash-can-outline" size={16} color="#fff" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.placeholderImage}>
                    <Icon name="camera" size={40} color="#ffd700" />
                    <Text style={styles.addPhotoText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              {!isExistingUser && (
                <LottieView
                  source={require('../assets/lottieJson/registration.json')}
                  autoPlay
                  loop
                  style={styles.lottieAnimation}
                />
              )}
            </View>

            <View style={styles.userInfoContainer}>
              <Text style={styles.sectionTitle}>
                {isExistingUser ? 'Your Profile' : 'Create Profile'}
              </Text>

              <View style={styles.inputContainer}>
                <Icon name="account" size={24} color="#ffd700" />
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#666"
                  value={user.name}
                  onChangeText={text =>
                    setUser(prevUser => ({...prevUser, name: text}))
                  }
                />
              </View>

              {user.name && (
                <View style={styles.lastUpdatedContainer}>
                  <Icon name="clock-outline" size={16} color="#ffd700" />
                  <Text style={styles.lastUpdatedText}>
                    Last updated: {new Date().toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                !user.name && styles.saveButtonDisabled,
              ]}
              onPress={saveUserData}
              disabled={!user.name}>
              <Text style={styles.saveButtonText}>
                {isExistingUser ? 'Update Profile' : 'Save Profile'}
              </Text>
            </TouchableOpacity>

            {isExistingUser && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={async () => {
                  try {
                    await AsyncStorage.removeItem('userData');
                    setUser({name: '', image: null});
                    setIsExistingUser(false);
                    Alert.alert('Success', 'Profile deleted successfully!');
                  } catch (error) {
                    Alert.alert('Error', 'Failed to delete profile');
                  }
                }}>
                <Text style={styles.deleteButtonText}>Delete Profile</Text>
              </TouchableOpacity>
            )}
            <View style={{height: 100}} />
          </ScrollView>
          {/* </LinearGradient> */}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor: '#003366',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  lottieAnimation: {
    width: 250,
    height: 250,
  },
  userInfoContainer: {
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#ffd700',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: '#fff',
    fontSize: 16,
  },
  preferencesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  preferenceText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  toggleButton: {
    width: 50,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#ffd700',
  },
  saveButton: {
    backgroundColor: '#ffd700',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#003366',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#003366',
  },
  loadingAnimation: {
    width: 200,
    height: 200,
  },
  imageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 180,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#ffd700',
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 3,
    borderColor: '#ffd700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  welcomeText: {
    fontSize: 24,
    color: '#ffd700',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeAnimation: {
    width: 100,
    height: 100,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#ffd700',
    borderRadius: 15,
    padding: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  addPhotoText: {
    color: '#ffd700',
    marginTop: 8,
    fontSize: 12,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  lastUpdatedText: {
    color: '#ffd700',
    marginLeft: 5,
    fontSize: 12,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteImageButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    borderRadius: 15,
    padding: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default TabUserScreen;

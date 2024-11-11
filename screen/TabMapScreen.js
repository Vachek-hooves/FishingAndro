import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Platform, 
  PermissionsAndroid, 
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Animated,
  Linking
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'react-native-image-picker';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import Fish from 'react-native-vector-icons/Ionicons'
import { useAppContext } from '../store/context';

const waterOrientedMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#004B87"  // Deeper blue for water
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c8e6c9"  // Light green for parks
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#6b9a76"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e8f5e9"  // Very light green for natural areas
      }
    ]
  }
];

const DEFAULT_LOCATION = {
  latitude: 37.7749, // San Francisco coordinates
  longitude: -122.4194,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const TabMapScreen = () => {
  const { spots, updateSpots, location, updateLocation } = useAppContext();
  const [initialRegion, setInitialRegion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [markerTitle, setMarkerTitle] = useState('');
  const [markerDescription, setMarkerDescription] = useState('');
  const [markerImages, setMarkerImages] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [locationError, setLocationError] = useState(false);
  const [usingDefaultLocation, setUsingDefaultLocation] = useState(false);
  const [locationPermissionChecked, setLocationPermissionChecked] = useState(false);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          const region = {
            ...newLocation,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          updateLocation(newLocation, false); // Update location in context
          setLocationError(false);
          setInitialRegion(region);
          fadeOut();
          resolve(position);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationError(true);
          handleLocationDenied();
          reject(error);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 20000, 
          maximumAge: 1000,
          distanceFilter: 10,
          forceRequestLocation: true,
        }
      );
    });
  };

  useEffect(() => {
    const initializeMap = async () => {
      await loadMarkers();
      await checkLocationPermission();
    };

    initializeMap();
  }, []);

  const checkLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const granted = await Geolocation.requestAuthorization('whenInUse');
        if (granted === 'granted') {
          await getCurrentLocation();
        } else {
          showLocationPermissionDialog();
        }
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access',
            message: 'This app can show fishing spots near you. Would you like to enable location access?',
            buttonPositive: 'Yes, Enable',
            buttonNegative: 'Use Default Location',
            buttonNeutral: 'Ask Me Later'
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          await getCurrentLocation();
        } else {
          showLocationPermissionDialog();
        }
      }
    } catch (err) {
      console.warn(err);
      showLocationPermissionDialog();
    }
  };

  const showLocationPermissionDialog = () => {
    Alert.alert(
      'Location Access',
      'Would you like to use your current location to find fishing spots near you?',
      [
        {
          text: 'Use Default Location',
          onPress: () => useDefaultLocation(),
          style: 'cancel'
        },
        {
          text: 'Enable Location',
          onPress: retryLocation
        }
      ],
      { cancelable: false }
    );
  };

  const handleLocationDenied = () => {
    const defaultLoc = {
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude
    };
    
    updateLocation(defaultLoc, true); // Update context with default location
    setInitialRegion(DEFAULT_LOCATION);
    setIsLoading(false);
    Alert.alert(
      'Using Default Location',
      'The app will use a default location.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const useDefaultLocation = () => {
    const defaultLoc = {
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude
    };
    
    setUsingDefaultLocation(true);
    setInitialRegion(DEFAULT_LOCATION);
    setLocationPermissionChecked(true);
    updateLocation(defaultLoc, true); // Update context with default location
    setIsLoading(false);
    Alert.alert(
      'Using San Francisco Location',
      'You can enable location access later to find fishing spots near you.',
      [{ text: 'OK' }]
    );
  };

  const retryLocation = async () => {
    setIsLoading(true);
    setLocationError(false);
    
    try {
      if (locationPermissionChecked) {
        // If we've already checked permissions once, open settings
        if (Platform.OS === 'ios') {
          Alert.alert(
            'Location Access Required',
            'Please enable location access in Settings to find fishing spots near you.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                  setIsLoading(false);
                  handleLocationDenied();
                }
              },
              {
                text: 'Open Settings',
                onPress: () => {
                  Linking.openSettings();
                  setIsLoading(false);
                }
              }
            ]
          );
        } else {
          // For Android
          await requestLocationPermission();
        }
      } else {
        // First time requesting location
        await requestLocationPermission();
        setLocationPermissionChecked(true);
      }
    } catch (error) {
      console.error('Retry failed:', error);
      handleLocationDenied();
    }
  };

  // Update requestLocationPermission to track the first check
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        // First check current authorization status
        const currentStatus = await Geolocation.requestAuthorization('whenInUse');
        console.log('Current location status:', currentStatus);

        if (currentStatus === 'granted') {
          await getCurrentLocation();
        } else if (currentStatus === 'denied') {
          // If already denied, direct to settings
          Alert.alert(
            'Location Access Required',
            'Please enable location access in Settings to find fishing spots near you.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => handleLocationDenied()
              },
              {
                text: 'Open Settings',
                onPress: () => {
                  Linking.openSettings();
                  handleLocationDenied();
                }
              }
            ]
          );
        } else {
          // For other cases (like first time request)
          const granted = await Geolocation.requestAuthorization('whenInUse');
          if (granted === 'granted') {
            await getCurrentLocation();
          } else {
            handleLocationDenied();
          }
        }
      } else {
        // Android code remains the same
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access',
            message: 'This app can show fishing spots near you. Would you like to enable location access?',
            buttonPositive: 'Yes, Enable',
            buttonNegative: 'Use Default Location',
            buttonNeutral: 'Ask Me Later'
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          await getCurrentLocation();
        } else {
          handleLocationDenied();
        }
      }
      setLocationPermissionChecked(true);
    } catch (err) {
      console.warn('Permission error:', err);
      handleLocationDenied();
    }
  };

  const loadMarkers = async () => {
    try {
      const savedMarkers = await AsyncStorage.getItem('fishingSpots');
      if (savedMarkers) {
        const parsedMarkers = JSON.parse(savedMarkers);
        updateSpots(parsedMarkers);
      }
    } catch (error) {
      console.error('Error loading markers:', error);
    }
  };

  const handleMapLongPress = async (e) => {
    const newMarker = {
      id: Date.now(),
      coordinate: e.nativeEvent.coordinate,
      title: '',
      description: '',
      images: []
    };
    setSelectedMarker(newMarker);
    setMarkerTitle('');
    setMarkerDescription('');
    setMarkerImages([]);
    setModalVisible(true);
  };

  const handleMarkerPress = (marker) => {
    setSelectedMarker(marker);
    setMarkerTitle(marker.title);
    setMarkerDescription(marker.description);
    setMarkerImages(marker.images || []);
    setModalVisible(true);
  };

  const pickImage = async () => {
    try {
      const options = {
        mediaType: 'photo',
        quality: 0.5,
        selectionLimit: 0,
      };

      const result = await ImagePicker.launchImageLibrary(options);
      
      if (result.didCancel) return;
      
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage);
        return;
      }
      
      if (result.assets && result.assets.length > 0) {
        const newImages = result.assets.map(asset => ({
          id: Date.now() + Math.random(),
          uri: asset.uri
        }));
        setMarkerImages(prevImages => [...prevImages, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = (imageId) => {
    setMarkerImages(prevImages => prevImages.filter(img => img.id !== imageId));
  };

  const saveMarker = async () => {
    if (!markerTitle.trim()) {
      Alert.alert('Error', 'Please enter a title for the marker');
      return;
    }

    const updatedMarker = {
      ...selectedMarker,
      title: markerTitle,
      description: markerDescription,
      images: markerImages,
    };

    let updatedSpots;
    if (spots.find(m => m.id === selectedMarker.id)) {
      updatedSpots = spots.map(m => 
        m.id === selectedMarker.id ? updatedMarker : m
      );
    } else {
      updatedSpots = [...spots, updatedMarker];
    }

    try {
      await AsyncStorage.setItem('fishingSpots', JSON.stringify(updatedSpots));
      updateSpots(updatedSpots);
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving marker:', error);
      Alert.alert('Error', 'Failed to save marker');
    }
  };

  const deleteMarker = async () => {
    const updatedSpots = spots.filter(m => m.id !== selectedMarker.id);
    try {
      await AsyncStorage.setItem('fishingSpots', JSON.stringify(updatedSpots));
      updateSpots(updatedSpots);
      setModalVisible(false);
    } catch (error) {
      console.error('Error deleting marker:', error);
      Alert.alert('Error', 'Failed to delete marker');
    }
  };

  const renderImageItem = ({ item }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.uri }} style={styles.thumbnailImage} />
      <TouchableOpacity 
        style={styles.removeImageButton}
        onPress={() => removeImage(item.id)}
      >
        <Icon name="close" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setIsLoading(false));
  };

  return (
    <View style={styles.container}>
      {initialRegion && (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={!usingDefaultLocation}
          showsMyLocationButton={!usingDefaultLocation}
          onLongPress={handleMapLongPress}
          customMapStyle={waterOrientedMapStyle}
          mapType="terrain"
          showsBuildings={false}
          showsTraffic={false}
          showsIndoors={false}
          onMapReady={() => {
            console.log('Map is ready');
          }}
        >
          {spots.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
              onPress={() => handleMarkerPress(marker)}
            >
              <View style={styles.markerContainer}>
                <Fish name="fish" size={40} color="#08313a" />
                {marker.title && (
                  <View style={styles.markerLabelContainer}>
                    <Text style={styles.markerLabel}>{marker.title}</Text>
                  </View>
                )}
              </View>
            </Marker>
          ))}
        </MapView>
      )}

      {/* {usingDefaultLocation && (
        <TouchableOpacity 
          style={styles.enableLocationButton}
          onPress={retryLocation}
        >
          <Icon name="my-location" size={32} color="white" />
         
        </TouchableOpacity>
      )} */}

      {(isLoading || locationError) && (
        <Animated.View 
          style={[
            styles.loadingContainer,
            {
              opacity: fadeAnim,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }
          ]}
        >
          <View style={styles.loaderContent}>
            {locationError ? (
              <>
                <Icon name="location-disabled" size={50} color="#ff6b6b" />
                <Text style={styles.errorText}>Location Error</Text>
                <Text style={styles.errorSubText}>
                  Unable to get your location. Please check your:
                </Text>
                <View style={styles.errorChecklist}>
                  <Text style={styles.checklistItem}>• Internet connection</Text>
                  <Text style={styles.checklistItem}>• Location services</Text>
                  <Text style={styles.checklistItem}>• Location permissions</Text>
                </View>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={retryLocation}
                >
                  <Icon name="refresh" size={24} color="white" />
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <LoadingIndicator />
                <Text style={styles.loadingText}>Loading Map...</Text>
                <Text style={styles.loadingSubText}>Finding the perfect fishing spots</Text>
              </>
            )}
          </View>
        </Animated.View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {selectedMarker?.title ? 'Edit Fishing Spot' : 'New Fishing Spot'}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="Spot Name"
                value={markerTitle}
                onChangeText={setMarkerTitle}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={markerDescription}
                onChangeText={setMarkerDescription}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Icon name="add-photo-alternate" size={24} color="#666" />
                <Text style={styles.imageButtonText}>Add Photos</Text>
              </TouchableOpacity>

              {markerImages.length > 0 && (
                <FlatList
                  data={markerImages}
                  renderItem={renderImageItem}
                  keyExtractor={item => item.id.toString()}
                  horizontal
                  style={styles.imageList}
                  showsHorizontalScrollIndicator={false}
                />
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.saveButton]} 
                  onPress={saveMarker}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>

                {selectedMarker?.title && (
                  <TouchableOpacity 
                    style={[styles.button, styles.deleteButton]} 
                    onPress={deleteMarker}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    // justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingTop: '15%',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  imageButtonText: {
    marginLeft: 10,
    color: '#666',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  imageList: {
    marginBottom: 15,
  },
  imageContainer: {
    marginRight: 10,
    position: 'relative',
  },
  thumbnailImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#f44336',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  spinner: {
    marginVertical: 10,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  loadingSubText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginTop: 20,
  },
  errorSubText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  errorChecklist: {
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 30,
  },
  checklistItem: {
    fontSize: 16,
    color: '#666',
    marginVertical: 5,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerLabelContainer: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#004B87',
  },
  markerLabel: {
    color: '#004B87',
    fontSize: 12,
    fontWeight: 'bold',
  },
  enableLocationButton: {
    position: 'absolute',
    bottom: 140,
    right: 16,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  enableLocationText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
});

export default TabMapScreen;
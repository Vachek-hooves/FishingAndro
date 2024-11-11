import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Fish from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {useAppContext} from '../store/context';
import MainLayout from '../components/appLayout/MainLayout';

const {width} = Dimensions.get('window');

// Separate SpotCard component
const SpotCard = ({spot, onPress}) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => onPress(spot)}
    activeOpacity={0.7}>
    <LinearGradient colors={['#004B87', '#006494']} style={styles.cardGradient}>
      <View style={styles.cardContent}>
        <View style={styles.titleContainer}>
          <Fish name="fish" size={24} color="#ffd700" />
          <Text style={styles.cardTitle}>{spot.title}</Text>
        </View>
        <View style={styles.coordinatesContainer}>
          <Icon name="location-on" size={16} color="#ffd700" />
          <Text style={styles.coordinates}>
            {spot.coordinate.latitude.toFixed(6)},{' '}
            {spot.coordinate.longitude.toFixed(6)}
          </Text>
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

// Separate Modal component
const SpotDetailModal = ({visible, spot, onClose, onDelete}) => {
  if (!spot) return null;

  const handleDelete = () => {
    Alert.alert(
      'Delete Spot',
      'Are you sure you want to delete this fishing spot?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(spot.id),
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{spot.title}</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={handleDelete}
                  style={[styles.actionButton, styles.deleteButton]}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Icon name="delete" size={24} color="#ff4444" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.actionButton}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Icon name="close" size={24} color="#003366" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalCoordinates}>
              <Icon name="location-on" size={20} color="#003366" />
              <Text style={styles.modalCoordinatesText}>
                {spot.coordinate.latitude.toFixed(6)},
                {spot.coordinate.longitude.toFixed(6)}
              </Text>
            </View>

            {spot.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.descriptionText}>{spot.description}</Text>
              </View>
            )}

            {spot.images && spot.images.length > 0 && (
              <View style={styles.imagesContainer}>
                <Text style={styles.imagesTitle}>Photos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {spot.images.map((image, index) => (
                    <Image
                      key={index}
                      source={{uri: image.uri}}
                      style={styles.modalImage}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Main component
const TabSpotsScreen = () => {
  const {spots, updateSpots, deleteSpot} = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSpotPress = useCallback(spot => {
    setSelectedSpot(spot);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedSpot(null);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const savedSpots = await AsyncStorage.getItem('fishingSpots');
      if (savedSpots) {
        updateSpots(JSON.parse(savedSpots));
      }
    } catch (error) {
      console.error('Error refreshing spots:', error);
    }
    setRefreshing(false);
  };

  const handleDeleteSpot = async spotId => {
    const success = await deleteSpot(spotId);
    if (success) {
      handleCloseModal();
    } else {
      Alert.alert('Error', 'Failed to delete spot');
    }
  };

  return (
    <MainLayout>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffd700"
          />
        }>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>My Fishing Spots</Text>
        </View>
        {spots.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Fish name="fish-outline" size={60} color="#ffd700" />
            <Text style={styles.emptyText}>No fishing spots saved yet</Text>
            <Text style={styles.emptySubText}>
              Long press on the map to add your favorite spots
            </Text>
          </View>
        ) : (
          spots.map(spot => (
            <SpotCard key={spot.id} spot={spot} onPress={handleSpotPress} />
          ))
        )}
      </ScrollView>

      <SpotDetailModal
        visible={modalVisible}
        spot={selectedSpot}
        onClose={handleCloseModal}
        onDelete={handleDeleteSpot}
      />
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 60,
    // backgroundColor:'rgba(0,0,0,0.2)'
  },
  headerContainer: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 16,
    textAlign: 'center',
    paddingVertical: 8,
    // color: 'rgba(0,0,0,0.9)',
  },
  card: {
    marginBottom: 16,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  cardGradient: {
    borderRadius: 15,
  },
  cardContent: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coordinates: {
    fontSize: 12,
    color: '#ffd700',
    marginLeft: 4,
  },
  description: {
    color: '#fff',
    marginBottom: 12,
    fontSize: 14,
    opacity: 0.9,
  },
  imageScroll: {
    marginTop: 8,
  },
  spotImage: {
    width: width / 3,
    height: width / 3,
    marginRight: 8,
  },
  expandedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  directionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffd700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 32,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    backfaceVisibility: 'hidden',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    borderTopWidth: 2,
    borderColor: '#ffd700',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
  },
  closeButton: {
    padding: 5,
  },
  modalCoordinates: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0,75,135,0.1)',
    padding: 10,
    borderRadius: 8,
  },
  modalCoordinatesText: {
    marginLeft: 8,
    color: '#003366',
    fontSize: 14,
  },
  descriptionContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(0,75,135,0.05)',
    padding: 15,
    borderRadius: 12,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 8,
  },
  descriptionText: {
    color: '#444',
    lineHeight: 20,
  },
  imagesContainer: {
    marginBottom: 20,
  },
  imagesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 12,
  },
  modalImage: {
    width: width * 0.7,
    height: width * 0.5,
    borderRadius: 12,
    marginRight: 12,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  directionsButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 5,
    marginLeft: 15,
  },
  deleteButton: {
    marginRight: 5,
  },
});

export default TabSpotsScreen;

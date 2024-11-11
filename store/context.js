import { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEFAULT_LOCATION = {
  latitude: 37.7749, // San Francisco coordinates
  longitude: -122.4194,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Create the context
const AppContext = createContext();

// Create a provider component
export function AppProvider({ children }) {
    // Define your state values here
    const [spots, setSpots] = useState([]);
    const [location, setLocation] = useState({
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude
    });
    const [usingDefaultLocation, setUsingDefaultLocation] = useState(false);
    
    // Add function to update spots
    const updateSpots = async (newSpots) => {
        setSpots(newSpots);
    };

    const updateLocation = (newLocation, isDefault = false) => {
        if (newLocation && newLocation.latitude && newLocation.longitude) {
            setLocation(newLocation);
            setUsingDefaultLocation(isDefault);
        }
    };

    const deleteSpot = async (spotId) => {
        try {
            const updatedSpots = spots.filter(spot => spot.id !== spotId);
            await AsyncStorage.setItem('fishingSpots', JSON.stringify(updatedSpots));
            setSpots(updatedSpots);
            return true;
        } catch (error) {
            console.error('Error deleting spot:', error);
            return false;
        }
    };

    // Create an object with all values and functions you want to share
    const value = {
        spots,
        updateSpots,
        deleteSpot,
        location,
        usingDefaultLocation,
        updateLocation
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

// Create a custom hook to use the context
export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}

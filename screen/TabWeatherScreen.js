import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
  RefreshControl,
  ImageBackground
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import LinearGradient from 'react-native-linear-gradient';
import { useAppContext } from '../store/context';
import MainLayout from '../components/appLayout/MainLayout';

const API_KEY = 'da09552db9dee8853551090775811fb7'; // Get from openweathermap.org

const DEFAULT_LOCATION = {
  latitude: 37.7749,  // San Francisco coordinates
  longitude: -122.4194
};

const TabWeatherScreen = () => {
  const { location, usingDefaultLocation } = useAppContext();
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (location && location.latitude && location.longitude) {
      fetchWeatherData(location.latitude, location.longitude);
    }
  }, [location]);

  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`,
      );
      const data = await response.json();
      console.log(data)
      
      if (data.cod === 200) {
        setWeatherData(data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      Alert.alert('Error', 'Failed to fetch weather data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (location) {
      await fetchWeatherData(location.latitude, location.longitude);
    }
  };

  const getWeatherIcon = weatherId => {
    if (weatherId >= 200 && weatherId < 300) return 'weather-lightning';
    if (weatherId >= 300 && weatherId < 400) return 'weather-pouring';
    if (weatherId >= 500 && weatherId < 600) return 'weather-rainy';
    if (weatherId >= 600 && weatherId < 700) return 'weather-snowy';
    if (weatherId >= 700 && weatherId < 800) return 'weather-fog';
    if (weatherId === 800) return 'weather-sunny';
    if (weatherId > 800) return 'weather-cloudy';
    return 'weather-cloudy';
  };

  const formatTime = (timestamp, timezone) => {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });
  };

  const renderLocationIndicator = () => {
    if (usingDefaultLocation) {
      return (
        <View style={styles.defaultLocationBanner}>
          <Icon name="information" size={20} color="#ffd700" />
          <Text style={styles.defaultLocationText}>
            Using San Francisco location
          </Text>
        </View>
      );
    }
    return null;
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    // <LinearGradient
    //   colors={['#003366', '#004d99', '#0066cc']} // Deep blue to lighter blue
    //   style={styles.mainContainer}
    //   start={{x: 0, y: 0}}
    //   end={{x: 1, y: 1}}>
    
<MainLayout>
    
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        refreshControl={
          <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor="#fff"
          colors={["#ffd700"]}
          />
        }
        >
        {renderLocationIndicator()}
        {weatherData && (
          <View style={styles.weatherContainer}>
            {/* Location Header */}
            <View style={styles.locationHeader}>
              <Text style={styles.location}>{weatherData.name}, {weatherData.sys.country}</Text>
              <Text style={styles.coordinates}>
                {weatherData.coord.lat.toFixed(2)}°N, {weatherData.coord.lon.toFixed(2)}°W
              </Text>
            </View>

            {/* Main Weather */}
            <View style={styles.mainWeather}>
              <Icon 
                name={getWeatherIcon(weatherData.weather[0].id)} 
                size={80} 
                color="#333" 
              />
              <View style={styles.tempContainer}>
                <Text style={styles.temperature}>{Math.round(weatherData.main.temp)}°C</Text>
                <Text style={styles.weatherDescription}>
                  {weatherData.weather[0].description.charAt(0).toUpperCase() + 
                   weatherData.weather[0].description.slice(1)}
                </Text>
              </View>
            </View>

            {/* Temperature Details */}
            <View style={styles.tempDetails}>
              <View style={styles.tempItem}>
                <Text style={styles.tempLabel}>Feels Like</Text>
                <Text style={styles.tempValue}>{Math.round(weatherData.main.feels_like)}°C</Text>
              </View>
              <View style={styles.tempItem}>
                <Text style={styles.tempLabel}>Min</Text>
                <Text style={styles.tempValue}>{Math.round(weatherData.main.temp_min)}°C</Text>
              </View>
              <View style={styles.tempItem}>
                <Text style={styles.tempLabel}>Max</Text>
                <Text style={styles.tempValue}>{Math.round(weatherData.main.temp_max)}°C</Text>
              </View>
            </View>

            {/* Weather Details Grid */}
            <View style={styles.detailsGrid}>
              <View style={styles.detailBox}>
                <Icon name="water-percent" size={24} color="#666" />
                <Text style={styles.detailLabel}>Humidity</Text>
                <Text style={styles.detailValue}>{weatherData.main.humidity}%</Text>
              </View>

              <View style={styles.detailBox}>
                <Icon name="weather-windy" size={24} color="#666" />
                <Text style={styles.detailLabel}>Wind Speed</Text>
                <Text style={styles.detailValue}>{Math.round(weatherData.wind.speed * 3.6)} km/h</Text>
              </View>

              <View style={styles.detailBox}>
                <Icon name="gauge" size={24} color="#666" />
                <Text style={styles.detailLabel}>Pressure</Text>
                <Text style={styles.detailValue}>{weatherData.main.pressure} hPa</Text>
              </View>

              <View style={styles.detailBox}>
                <Icon name="eye" size={24} color="#666" />
                <Text style={styles.detailLabel}>Visibility</Text>
                <Text style={styles.detailValue}>{(weatherData.visibility / 1000).toFixed(1)} km</Text>
              </View>
            </View>

            {/* Additional Details */}
            <View style={styles.additionalDetails}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              <View style={styles.additionalDetailsGrid}>
                <View style={styles.additionalDetailBox}>
                  <Icon name="cloud" size={24} color="#003366" />
                  <Text style={styles.additionalDetailLabel}>Cloud Cover</Text>
                  <Text style={styles.additionalDetailValue}>{weatherData.clouds.all}%</Text>
                </View>
                
                {weatherData.wind.gust && (
                  <View style={styles.additionalDetailBox}>
                    <Icon name="weather-windy" size={24} color="#003366" />
                    <Text style={styles.additionalDetailLabel}>Wind Gust</Text>
                    <Text style={styles.additionalDetailValue}>
                      {Math.round(weatherData.wind.gust * 3.6)} km/h
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
        <View style={styles.bottomPadding} />
      
        </MainLayout>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    marginTop: 60,
  },
  scrollViewContent: {
    flexGrow: 1,
    // paddingVertical: 16,
    paddingTop: 60,
  },
  bottomPadding: {
    height: 120, // Adds some padding at the bottom of the scroll
  },
  weatherContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Slightly transparent white
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    
  },
  locationHeader: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 51, 102, 0.8)', // More transparent
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  location: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd700', // Gold text
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  coordinates: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  mainWeather: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(0, 51, 102, 0.05)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  tempContainer: {
    marginLeft: 20,
    alignItems: 'center',
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#003366', // Deep blue
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  weatherDescription: {
    fontSize: 18,
    color: '#004d99', // Medium blue
    marginTop: 4,
    fontWeight: '500',
  },
  tempDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: '#003366',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tempItem: {
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 215, 0, 0.3)',
  },
  tempLabel: {
    fontSize: 14,
    color: '#ffd700', // Gold
    fontWeight: '500',
  },
  tempValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailBox: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly transparent
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  detailLabel: {
    fontSize: 14,
    color: '#003366',
    marginTop: 8,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004d99',
    marginTop: 4,
  },
  additionalDetails: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly transparent
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 12,
    textAlign: 'center',
  },
  additionalDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  additionalDetailBox: {
    width: '45%',
    backgroundColor: 'rgba(0, 51, 102, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    backdropFilter: 'blur(10px)', // Note: This works on iOS, for Android you might need extra setup
  },
  additionalDetailLabel: {
    fontSize: 14,
    color: '#003366',
    marginTop: 8,
    fontWeight: '500',
  },
  additionalDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004d99',
    marginTop: 4,
  },
  defaultLocationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    marginHorizontal:10,
    borderRadius:12
  },
  defaultLocationText: {
    color: '#ffd700',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    
  },
});

export default TabWeatherScreen;

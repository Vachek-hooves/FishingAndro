import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import CalendarStrip from 'react-native-calendar-strip';
import SunCalc from 'suncalc';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useAppContext} from '../store/context';

const DEFAULT_LOCATION = {
  latitude: 37.7749, // San Francisco coordinates
  longitude: -122.4194,
};

const getFishingRating = (moonPhase, weather) => {
  // Moon phase fishing ratings (0-10 scale)
  const moonRatings = {
    NEW_MOON: 8, // Excellent for fishing
    WAXING_CRESCENT: 7,
    FIRST_QUARTER: 6,
    WAXING_GIBBOUS: 5,
    FULL_MOON: 9, // Best time for fishing
    WANING_GIBBOUS: 5,
    LAST_QUARTER: 6,
    WANING_CRESCENT: 7,
  };

  // Weather condition ratings (0-10 scale)
  const weatherRatings = {
    Clear: 8,
    Clouds: 7,
    Rain: 4,
    Thunderstorm: 2,
    Snow: 3,
    Mist: 6,
    Fog: 5,
  };

  const getMoonPhaseCategory = phase => {
    if (phase < 0.03) return 'NEW_MOON';
    if (phase < 0.25) return 'WAXING_CRESCENT';
    if (phase < 0.28) return 'FIRST_QUARTER';
    if (phase < 0.47) return 'WAXING_GIBBOUS';
    if (phase < 0.53) return 'FULL_MOON';
    if (phase < 0.72) return 'WANING_GIBBOUS';
    if (phase < 0.78) return 'LAST_QUARTER';
    if (phase < 0.97) return 'WANING_CRESCENT';
    return 'NEW_MOON';
  };

  const moonCategory = getMoonPhaseCategory(moonPhase);
  const moonScore = moonRatings[moonCategory] || 5;
  const weatherScore = weatherRatings[weather] || 5;

  // Calculate overall rating
  const overallRating = (moonScore + weatherScore) / 2;

  return {
    rating: Math.round(overallRating),
    moonPhaseAdvice: getFishingAdviceForMoonPhase(moonCategory),
    weatherAdvice: getFishingAdviceForWeather(weather),
    bestTimeRanges: getBestFishingTimes(moonCategory),
  };
};

const getFishingAdviceForMoonPhase = moonPhase => {
  const advice = {
    NEW_MOON: {
      general:
        'Excellent fishing period! Fish are more active during the new moon.',
      tips: [
        'Fish tend to feed more during this time',
        'Best results during dawn and dusk',
        'Use dark-colored lures',
      ],
    },
    FULL_MOON: {
      general: 'Peak fishing time! Fish activity is at its highest.',
      tips: [
        'Fish are likely to feed throughout the night',
        'Use light-colored or reflective lures',
        'Focus on shallow waters',
      ],
    },
    FIRST_QUARTER: {
      general: 'Good fishing conditions, especially during moonrise.',
      tips: [
        'Focus on the hours around moonrise',
        'Try both surface and deep water fishing',
        'Moderate lure colors work best',
      ],
    },
    // ... add more phases
  };

  return (
    advice[moonPhase] || {
      general: 'Moderate fishing conditions.',
      tips: [
        'Try different depths',
        'Experiment with lure colors',
        'Focus on known fishing spots',
      ],
    }
  );
};

const getFishingAdviceForWeather = weather => {
  const advice = {
    Clear: {
      tips: [
        'Use sunscreen and stay hydrated',
        'Fish might be deeper in water during bright days',
        'Early morning and late evening are best',
      ],
    },
    Clouds: {
      tips: [
        'Ideal conditions for fishing',
        'Fish might be more active near surface',
        'Try different depths throughout the day',
      ],
    },
    Rain: {
      tips: [
        'Fish are often more active before and after rain',
        'Use brighter lures for better visibility',
        'Focus on areas where rain creates surface disturbance',
      ],
    },
    // ... add more weather conditions
  };

  return (
    advice[weather] || {
      tips: [
        'Check local fishing reports',
        'Adjust techniques based on conditions',
      ],
    }
  );
};

const getBestFishingTimes = moonPhase => {
  // Returns best fishing time ranges based on moon phase
  const timeRanges = {
    NEW_MOON: ['Dawn (30min before sunrise)', 'Dusk (30min after sunset)'],
    FULL_MOON: ['Midnight to 2AM', 'Noon to 2PM'],
    // ... add more phases
  };

  return timeRanges[moonPhase] || ['Early morning', 'Late evening'];
};

const FishingAdvice = ({moonPhase, weather}) => {
  const fishingInfo = getFishingRating(moonPhase, weather);

  return (
    <View style={styles.fishingAdviceContainer}>
      <Text style={styles.fishingTitle}>Fishing Forecast</Text>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>
          Today's Rating: {fishingInfo.rating}/10
        </Text>
        <View style={styles.ratingBar}>
          <LinearGradient
            colors={['#ffd700', '#ffa500']}
            style={[styles.ratingFill, {width: `${fishingInfo.rating * 10}%`}]}
          />
        </View>
      </View>

      <View style={styles.adviceSection}>
        <Text style={styles.adviceTitle}>Moon Phase Advice</Text>
        <Text style={styles.adviceText}>
          {fishingInfo.moonPhaseAdvice.general}
        </Text>
        {fishingInfo.moonPhaseAdvice.tips.map((tip, index) => (
          <View key={index} style={styles.tipContainer}>
            <Icon name="fish" size={16} color="#ffd700" />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      <View style={styles.adviceSection}>
        <Text style={styles.adviceTitle}>Best Times Today</Text>
        {fishingInfo.bestTimeRanges.map((time, index) => (
          <Text key={index} style={styles.timeText}>
            • {time}
          </Text>
        ))}
      </View>
    </View>
  );
};

const formatTime = date => {
  if (!date) return '--:--';
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const SunTimesInfo = ({date, latitude, longitude}) => {
  const sunTimes = SunCalc.getTimes(date, latitude, longitude);
  const sunPosition = SunCalc.getPosition(date, latitude, longitude);

  return (
    <View style={styles.sunInfoContainer}>
      <Text style={styles.sunInfoTitle}>Sun Information</Text>

      <View style={styles.sunTimesGrid}>
        <View style={styles.sunTimeItem}>
          <Icon name="weather-sunset-up" size={24} color="#ffd700" />
          <Text style={styles.sunTimeLabel}>Sunrise</Text>
          <Text style={styles.sunTimeValue}>
            {formatTime(sunTimes.sunrise)}
          </Text>
        </View>

        <View style={styles.sunTimeItem}>
          <Icon name="weather-sunset-down" size={24} color="#ffd700" />
          <Text style={styles.sunTimeLabel}>Sunset</Text>
          <Text style={styles.sunTimeValue}>{formatTime(sunTimes.sunset)}</Text>
        </View>

        <View style={styles.sunTimeItem}>
          <Icon name="weather-night" size={24} color="#ffd700" />
          <Text style={styles.sunTimeLabel}>Night Start</Text>
          <Text style={styles.sunTimeValue}>{formatTime(sunTimes.night)}</Text>
        </View>

        <View style={styles.sunTimeItem}>
          <Icon name="weather-sunset" size={24} color="#ffd700" />
          <Text style={styles.sunTimeLabel}>Dawn</Text>
          <Text style={styles.sunTimeValue}>{formatTime(sunTimes.dawn)}</Text>
        </View>

        <View style={styles.sunTimeItem}>
          <Icon name="star-face" size={24} color="#ffd700" />
          <Text style={styles.sunTimeLabel}>Nautical Dusk</Text>
          <Text style={styles.sunTimeValue}>
            {formatTime(sunTimes.nauticalDusk)}
          </Text>
        </View>

        <View style={styles.sunTimeItem}>
          <Icon name="brightness-5" size={24} color="#ffd700" />
          <Text style={styles.sunTimeLabel}>Night End</Text>
          <Text style={styles.sunTimeValue}>
            {formatTime(sunTimes.nightEnd)}
          </Text>
        </View>
      </View>

      <View style={styles.sunPositionContainer}>
        <Text style={styles.sunPositionTitle}>Sun Position</Text>
        <Text style={styles.sunPositionText}>
          Altitude: {Math.round((sunPosition.altitude * 180) / Math.PI)}°
        </Text>
        <Text style={styles.sunPositionText}>
          Azimuth: {Math.round((sunPosition.azimuth * 180) / Math.PI)}°
        </Text>
      </View>
    </View>
  );
};

const TabMoonScreen = () => {
  const {location} = useAppContext();
  const [selectedMoonPhase, setSelectedMoonPhase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (location && location.latitude && location.longitude) {
      handleDateSelected(new Date());
      setIsLoading(false);
    }
  }, [location]);

  const handleDateSelected = date => {
    if (!location || !date) return;

    const selectedDate = date._d || new Date(date);

    const moonIllum = SunCalc.getMoonIllumination(selectedDate);
    const moonTimes = SunCalc.getMoonTimes(
      selectedDate,
      location.latitude,
      location.longitude,
    );

    setSelectedMoonPhase({
      phase: moonIllum.phase,
      illumination: Math.round(moonIllum.fraction * 100),
      angle: moonIllum.angle,
      times: moonTimes,
      date: selectedDate.toDateString(),
    });
  };

  const MoonVisualization = ({phase, illumination}) => {
    const size = Dimensions.get('window').width * 0.6;
    return (
      <View style={[styles.moonContainer, {width: size, height: size}]}>
        <LinearGradient
          colors={['#1a237e', '#000']}
          style={styles.moonBackground}>
          <View style={styles.moonPhase}>
            <LinearGradient
              colors={['#ffd700', '#ffa500']}
              style={[styles.moonLight, {opacity: illumination / 100}]}
            />
            <View style={[styles.moonShadow, getMoonShadowStyle(phase)]} />
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../assets/bg/bg.png')}
      style={{flex: 1, paddingTop: 50}}>
      <View style={styles.calendarContainer}>
        <CalendarStrip
          scrollable
          style={styles.calendarStrip}
          calendarColor={'transparent'}
          calendarHeaderStyle={styles.calendarHeader}
          dateNumberStyle={styles.dateNumber}
          dateNameStyle={styles.dateName}
          highlightDateNumberStyle={styles.highlightDateNumber}
          highlightDateNameStyle={styles.highlightDateName}
          onDateSelected={handleDateSelected}
          useIsoWeekday={false}
          minDate={new Date().setDate(new Date().getDate() - 30)}
          maxDate={new Date().setDate(new Date().getDate() + 60)}
          selectedDate={new Date()}
          daySelectionAnimation={{
            type: 'border',
            duration: 200,
            borderWidth: 1,
            borderHighlightColor: '#ffd700',
          }}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleDateSelected}
            tintColor="#ffd700"
          />
        }>
        {selectedMoonPhase && location && (
          <>
            <View style={styles.moonInfoContainer}>
              <Text style={styles.dateText}>{selectedMoonPhase.date}</Text>

              <MoonVisualization
                phase={selectedMoonPhase.phase}
                illumination={selectedMoonPhase.illumination}
              />

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Icon name="moon-full" size={30} color="#ffd700" />
                  <Text style={styles.infoLabel}>Illumination</Text>
                  <Text style={styles.infoValue}>
                    {selectedMoonPhase.illumination}%
                  </Text>
                </View>

                {selectedMoonPhase.times.rise && (
                  <View style={styles.infoItem}>
                    <Icon name="weather-sunset-up" size={30} color="#ffd700" />
                    <Text style={styles.infoLabel}>Moonrise</Text>
                    <Text style={styles.infoValue}>
                      {selectedMoonPhase.times.rise.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                )}

                {selectedMoonPhase.times.set && (
                  <View style={styles.infoItem}>
                    <Icon
                      name="weather-sunset-down"
                      size={30}
                      color="#ffd700"
                    />
                    <Text style={styles.infoLabel}>Moonset</Text>
                    <Text style={styles.infoValue}>
                      {selectedMoonPhase.times.set.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <SunTimesInfo
              date={new Date(selectedMoonPhase.date)}
              latitude={location.latitude}
              longitude={location.longitude}
            />

            <FishingAdvice
              moonPhase={selectedMoonPhase.phase}
              weather="Clear"
            />
          </>
        )}
        <View style={{height: 100}}></View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor: '#003366',
  },
  container: {
    flex: 1,
  },
  calendarContainer: {
    paddingTop: 10,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
    marginBottom: 10,
    // backgroundColor: '#003366',
  },
  calendarStrip: {
    height: 130,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  calendarHeader: {
    color: '#fff',
    fontSize: 18,
  },
  dateNumber: {
    color: '#fff',
    fontSize: 16,
  },
  dateName: {
    color: '#fff',
  },
  highlightDateNumber: {
    color: '#ffd700',
  },
  highlightDateName: {
    color: '#ffd700',
  },
  moonInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dateText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  moonContainer: {
    borderRadius: 999,
    overflow: 'hidden',
    marginVertical: 20,
    elevation: 10,
    shadowColor: '#ffd700',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  moonBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moonPhase: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  moonLight: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  moonShadow: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#000',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  infoItem: {
    alignItems: 'center',
    width: '33%',
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
  },
  infoLabel: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
  },
  infoValue: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  fishingAdviceContainer: {
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fishingTitle: {
    fontSize: 20,
    color: '#ffd700',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  ratingContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  ratingText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  ratingBar: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  ratingFill: {
    height: '100%',
    borderRadius: 5,
  },
  adviceSection: {
    marginBottom: 20,
  },
  adviceTitle: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  adviceText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  sunInfoContainer: {
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sunInfoTitle: {
    fontSize: 20,
    color: '#ffd700',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  sunTimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sunTimeItem: {
    width: '48%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  sunTimeLabel: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.9,
  },
  sunTimeValue: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  sunPositionContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  sunPositionTitle: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  sunPositionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
});

const getMoonShadowStyle = phase => {
  const shadowWidth = '50%';
  if (phase <= 0.5) {
    return {
      left: 0,
      width: shadowWidth,
      transform: [{translateX: -50 * (1 - phase * 2) + '%'}],
    };
  } else {
    return {
      right: 0,
      width: shadowWidth,
      transform: [{translateX: 50 * (2 - phase * 2) + '%'}],
    };
  }
};

export default TabMoonScreen;

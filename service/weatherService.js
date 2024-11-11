import axios from 'axios';

const API_KEY = 'da09552db9dee8853551090775811fb7'; // Sign up at OpenWeatherMap for free API key
const BASE_URL = 'https://api.openweathermap.org/data/3.0';

export const getWeather = async (lat, lon) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    console.log(response.data);
    return response.data
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};
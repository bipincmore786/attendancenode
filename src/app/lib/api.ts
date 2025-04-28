import axios from 'axios';

const API_URL = 'https://dummyjson.com/c/378b-70b1-4c56-a5f2';
const USERNAME = 'rfccrm';
const PASSWORD = 'Initial0@';

export const sendAttendanceData = async (data: {
  activationCode: string;
  userName: string;
  phoneNumber: string;
  orgName: string;
  deviceId: string;
  ipAddress: string;
  token: string;
  location: {
    latitude: number;
    longitude: number;
  };
  locationName: string;
}) => {
  try {
    const response = await axios.post(API_URL, data, {
      auth: {
        username: USERNAME,
        password: PASSWORD,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error sending attendance data:', error.response?.data || error.message);
    throw error;
  }
};

import axios, { AxiosError } from 'axios';

const API_URL = 'https://dummyjson.com/c/378b-70b1-4c56-a5f2';
const VALIDATE_EVENT_CODE = 'http://APAR-S4-Public-NLB-48e77eaa902d59f9.elb.ap-south-1.amazonaws.com:8020/sap/bc/rest/rest_webevent?sap-client=400';
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
  } catch (error) {
    const err = error as AxiosError;
    console.error('Error sending attendance data:', err?.response?.data || err.message);
    throw error;
  }
};


export const sendActivationCode = async (data: {
  eventcode: string;
  apikey: string;
}) => {
  try {
    const response = await axios.post(VALIDATE_EVENT_CODE, data, {
      auth: {
        username: USERNAME,
        password: PASSWORD,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Error sending attendance data:', err?.response?.data || err.message);
    throw error;
  }
};

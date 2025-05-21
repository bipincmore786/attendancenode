import axios, { AxiosError } from 'axios';

// const API_URL = 'https://dummyjson.com/c/378b-70b1-4c56-a5f2';
const API_URL = '/api/rest_webevent'; // 'https://dev.aparapi.co.in:8100/sap/bc/rest/rest_webevent?sap-client=400';// 'http://APAR-S4-Public-NLB-48e77eaa902d59f9.elb.ap-south-1.amazonaws.com:8020/sap/bc/rest/rest_webevent?sap-client=400'; //'https://10.52.2.46:44300/sap/bc/rest/rest_webevent?sap-client=400'; 
const USERNAME = 'rfccrm';
const PASSWORD = 'Initial0@';

export const sendAttendanceData = async (data: {
  apikey: string,
  eventcode: string,
  vstrname: string,
  vstrnumb: string,
  vstrfrom: string,
  geoloc: string,
  geolat: number,
  geolon: number;
}) => {
  try {
    const response = await axios.post(API_URL, data, {
      // auth: {
      //   username: USERNAME,
      //   password: PASSWORD,
      // },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('rfccrm' + ':' + 'Initial0@'),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'HEAD, GET, POST, OPTIONS, PUT, PATCH, DELETE',
        'Access-Control-Allow-Headers': '*',
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
    const response = await axios.post(API_URL, data, {
      // auth: {
      //   username: USERNAME,
      //   password: PASSWORD,
      // },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('rfccrm' + ':' + 'Initial0@'),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'HEAD, GET, POST, OPTIONS, PUT, PATCH, DELETE',
        'Access-Control-Allow-Headers': '*',
      },
    });

    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.log(err)
    // console.log('Error sending attendance data:', err?.response?.data || err.message);
    throw error;
  }
};

export const verifyAPI = async () => {
  try {
    const response = await axios.post('https://6826f87a397e48c91318016c.mockapi.io/eventattendance/eventcode', { "apikey": "VALIDATE", "eventcode": "E00001" }, {
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
}

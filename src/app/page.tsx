'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
// import FingerprintJS from '@fingerprintjs/fingerprintjs';


export default function HomePage() {
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('');




  const generateToken = (userName: string, phoneNumber: string): string => {
    const timestamp = Date.now().toString(); // Current time in milliseconds
    const seed = userName + phoneNumber + timestamp;

    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0; // Convert to 32-bit integer
    }

    // Convert to positive number and format to 6 digits
    const numericToken = Math.abs(hash % 1000000).toString().padStart(6, '0');
    return numericToken;
  };

  const getFingerprint = async () => {
    // const fp = await FingerprintJS.load();
    // const result = await fp.get();
    // console.log("result:: ", result.visitorId)

    try {
      // const fp = await FingerprintJS.load();
      // const result = await fp.get();
      // setVisitorId(result.visitorId);
      // console.log("visitorId:: 2 ", visitorId)
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      setVisitorId(data.ip);
    } catch (error) {
      console.error('Fingerprint error:', error);
      setVisitorId(null);
    } finally {
      // setLoadingDevice(false);
    }
    console.log("visitorId:: 2 ", visitorId)

    return visitorId; // unique & consistent ID
  };

  useEffect(() => {
    if (visitorId == null) {
      return
    }
    console.log("visitorId changed ", visitorId)
  }, [visitorId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear form fields
    // setUserName('');
    // setPhoneNumber('');
    setLoading(true); // Start loading
    console.log(error)
    setToken('')
    setLocation(null)

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const tokenValue = generateToken(userName, phoneNumber);
        setToken(tokenValue);
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        const { latitude, longitude } = position.coords;
        const locationName = await getLocationName(latitude, longitude);

        console.log("locationName:: ", locationName)
        setLocationName(locationName)

        setLoading(false); // Stop loading

      },
      () => {
        alert('Location permission denied. Cannot generate token.');
        setLoading(false); // Stop loading
      }
    );
  };

  const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      console.log("locationData:: ", data)

      return data.display_name || 'Location not found';
    } catch (error) {
      console.log(error)
      return 'Failed to fetch location name';
    }
  };


  useEffect(() => {

    // const fetchFingerprint = async () => {
    //   try {
    //     const fp = await FingerprintJS.load();
    //     const result = await fp.get();
    //     setDeviceId(result.visitorId);
    //   } catch (error) {
    //     console.error('Fingerprint error:', error);
    //     setDeviceId(null);
    //   } finally {
    //     // setLoadingDevice(false);
    //   }
    // };
    // fetchFingerprint();

    const deviceId = uuidv4();
    getFingerprint();

    console.log("deviceId:: ", deviceId)
    console.log("visitorId:: 1 ", visitorId)
    console.log(navigator.userAgent);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Location permission denied.');
            break;
          case error.POSITION_UNAVAILABLE:
            alert('Location info unavailable.');
            break;
          case error.TIMEOUT:
            alert('Location request timed out.');
            break;
          // case error.UNKNOWN_ERROR:
          //   alert('An unknown location error occurred.');
          //   break;
        }
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center  text-[#000000]">Visitor Form</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 ">Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value)

              }}
              className="w-full p-2 border border-gray-300 rounded-md mt-1 text-[#000000]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={phoneNumber}
              onChange={(e) => {
                //  setPhoneNumber(e.target.value) 
                const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                setPhoneNumber(onlyNums);
              }}
              className="w-full p-2 border border-gray-300 rounded-md mt-1 text-[#000000]"
              required
              maxLength={10}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            {loading ? 'Please wait...' : 'Submit'}
          </button>
        </form>
        {/* {loading && (
          <p className="text-center text-gray-600 mt-4">Fetching location...</p>
        )} */}
        {loading && (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent shadow-lg"></div>
          </div>

        )}

        {token && (
          <div className="mt-6 text-center">
            {/* <p className="text-lg font-semibold text-green-700">Your token number is : {token}</p> */}
            <h2 className="text-xl font-semibold  text-[#000000]">Your token number is : {token}</h2>
            <p className="text-s font-semibold  text-[#000000]">Your visitorId is : {visitorId}</p>
            <p className="text-sm text-gray-500 mt-1  text-[#000000]">
              Please share this token at the check-in desk.
            </p>
            {location && (
              <p className="text-sm text-gray-700 mt-2 ">
                Location: Lat <span className='text-[#00563F]'>{location.latitude.toFixed(5)}</span>, Lng  <span className='text-[#00563F]'>{location.longitude.toFixed(5)}</span>
              </p>

            )}
            <p className="text-sm text-gray-700 mt-2 ">
              Location: <span className='text-[#00563F]'>{locationName}</span>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

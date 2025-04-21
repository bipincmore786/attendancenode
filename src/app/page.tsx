'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
// import FingerprintJS from '@fingerprintjs/fingerprintjs';


export default function HomePage() {

  const DEVICE_ID_KEY = 'my_persistent_device_id_EVENT_1';


  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orgName, setOrgName] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('');
  const [showModal, setShowModal] = useState(false);



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
    const existingId = localStorage.getItem(DEVICE_ID_KEY);

    console.log(location, locationName)

    // if (existingId) {
    //   // setDeviceId(existingId);
    //   alert('You cannot submit the data again');
    //   return
    // } 
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

        const newId = uuidv4();
        localStorage.setItem(DEVICE_ID_KEY, newId);

        setToken(tokenValue);
        setShowModal(true); // Show popup
        setUserName('')
        setPhoneNumber('')
        setOrgName('')

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


    // else {
    // const newId = uuidv4();
    // localStorage.setItem(DEVICE_ID_KEY, newId);
    // setDeviceId(newId);
    // }
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
        {/* <h1 className="text-2xl font-bold mb-4 text-center  text-[#000000]">Visitor Form</h1> */}
        <div className="flex flex-col items-center mb-4">
          <img
            src="/aparlogo_transparent.png" // 🔁 Replace this with your actual logo path or URL
            // src={logo}
            alt="Company Logo"
            className="h-25 mb-2"
          />
          <h1 className="text-2xl font-bold text-center text-[#000000] mt-5">Visitor Form</h1>
        </div>

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
          <div>
            <label className="block text-sm font-medium text-gray-700 ">Organisation Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => {
                setOrgName(e.target.value)

              }}
              className="w-full p-2 border border-gray-300 rounded-md mt-1 text-[#000000]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 mt-2 rounded-md hover:bg-blue-700"
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
            {/* <h2 className="text-xl font-semibold  text-[#000000]">Your registration token is : {token}</h2>
            <p className="text-m font-semibold text-gray-900 mb-2">Please share this token with host.</p> */}

            {/* <p className="text-s font-semibold  text-[#000000]">Your visitorId is : {visitorId}</p>
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
            </p> */}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-60 bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-2xl max-w-xl w-full transform transition-all duration-300 scale-95 opacity-0 animate-fade-in">
            <div className='flex justify-center mb-4'>
              <img
                src="/check.png" // 🔁 Replace this with your actual logo path or URL
                // src={logo}
                alt="Company Logo"
                className="h-30 mb-2"
              />
            </div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">Thank you for registering with APAR </h2>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your registration token is:
              <span className="text-2xl font-bold text-blue-700"> {token}</span></h2>
            {/* <p className="text-lg font-bold text-blue-700">{token}</p> */}

            {/* <p className="text-sm font-semibold text-gray-800 mt-4">Visitor ID:</p> */}
            {/* <p className="text-sm text-blue-600 mb-2">{visitorId}</p> */}

            <p className="text-l text-gray-900 mb-2">Note: Please share this token with host.</p>

            {/* {location && (
              <p className="text-sm text-gray-700 mt-2">
                Location: <span className="text-green-700">Lat {location.latitude.toFixed(5)}</span>,
                <span className="ml-2 text-green-700">Lng {location.longitude.toFixed(5)}</span>
              </p>
            )} */}

            {/* {locationName && (
              <p className="text-sm text-gray-700 mt-1">
                Location: <span className="text-green-700">{locationName}</span>
              </p>
            )} */}

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}



    </main>
  );
}

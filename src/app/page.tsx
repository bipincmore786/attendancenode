'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);


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
      (position) => {
        const tokenValue = generateToken(userName, phoneNumber);
        setToken(tokenValue);
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false); // Stop loading

      },
      () => {
        alert('Location permission denied. Cannot generate token.');
        setLoading(false); // Stop loading
      }
    );
  };


  useEffect(() => {
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
      (err) => {
        setError('Permission denied or error getting location.' + err);
      }
    );
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center  text-[#000000]">User Info Form</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 ">Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mt-1  text-[#000000]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mt-1 text-[#000000]"
              required
              maxLength={10}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
        {loading && (
          <p className="text-center text-gray-600 mt-4">Fetching location...</p>
        )}
        {token && (
          <div className="mt-6 text-center">
            <p className="text-lg font-semibold text-green-700">Generated Token: {token}</p>
            {location && (
              <p className="text-sm text-gray-700 mt-2">
                Location: Lat {location.latitude.toFixed(5)}, Lng {location.longitude.toFixed(5)}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

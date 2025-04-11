'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState('');

  const generateToken = (name: string, phone: string): string => {
    const seed = name + phone;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    const numericToken = Math.abs(hash % 1000000).toString().padStart(6, '0');
    return numericToken;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const generated = generateToken(userName, phoneNumber);
        setToken(generated);

        alert(
          `User Name: ${userName}\nPhone Number: ${phoneNumber}\nLatitude: ${latitude}\nLongitude: ${longitude}`
        );
        console.log(latitude, longitude)
      },
      (error) => {
        alert('Location access denied. Please allow location access to continue.');
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
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        setError('Permission denied or error getting location.');
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
        {token && (
          <p className="mt-4 text-center text-green-600 font-semibold">
            Your 6-digit Token: {token}
          </p>
        )}
      </div>
    </main>
  );
}

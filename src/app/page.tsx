'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sendActivationCode, sendAttendanceData } from './lib/api';  //sendActivationCode
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import crypto from 'crypto';

export default function HomePage() {
  const DEVICE_ID_KEY = 'my_persistent_device_id_EVENT_1';
  const [activationCode, setActivationCode] = useState("");
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
  const [isActivated, setIsActivated] = useState(false);
  const [showError, setShowError] = useState(false);
  const [startDatetime, setStartDatetime] = useState('');
  const [endDatetime, setEndDatetime] = useState('');
  const [consoleMessage, setconsoleMessage] = useState("Bipin 1")

  const getFingerprint = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      console.log("IP data", data)
      setVisitorId(data.ip);
    } catch (error) {
      console.error('Fingerprint error:', error);
      setVisitorId(null);
    } finally {
      // setLoadingDevice(false);
    }
    console.log("IP", visitorId)
    return visitorId; // unique & consistent ID
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const today = new Date();

    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const yy = String(today.getFullYear()); // Get last two digits of the year

    const formattedDate = `${yy}-${mm}-${dd}`;

    // Check if the event dat e is in the future
    if (hasUserSubmittedForTheDay(formattedDate, activationCode)) {
      console.log("You have already submitted an event for this day.");
      toast.error("You have already submitted an event for this day.")
      return

    } else if (isEventInThePast(endDatetime)) {
      console.log("The event date is in past.");
      toast.error("The event date is in past.")
      return
    } else if (isEventInTheFuture(startDatetime)) {
      console.log("The event date is in the future.");
      toast.error("The event date is in the future.")
      return
    } else {

      const newSubmission = {
        code: activationCode,
        date: formattedDate,
        ipaddress: visitorId
      };

      // Get existing submissions
      const existingData = localStorage.getItem("lastSubmission");
      let submissions = [];

      if (existingData) {
        submissions = JSON.parse(existingData);
      }

      // Add new submission
      submissions.push(newSubmission);

      // Save back to localStorage
      localStorage.setItem("lastSubmission", JSON.stringify(submissions));
      toast.success("Event Data submitted succesfully.")

      // return
    }

    const existingId = localStorage.getItem(DEVICE_ID_KEY);
    const existingActication = localStorage.getItem(activationCode);
    console.log(location, existingId, existingActication)
    setLoading(true); // Start loading
    console.log(error)
    if (!navigator.geolocation) {
      toast.success('Geolocation is not supported by your browser.');
      return;
    }
    // const newId = uuidv4();

    if (!location) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // setToken(tokenValue);
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          const { latitude, longitude } = position.coords;
          const locationName = await getLocationName(latitude, longitude);
          setLocationName(locationName)
          // setLoading(false);

          sendRequest()
        },
        () => {
          toast.error('Location permission denied. Cannot generate token.');
          setLoading(false);
        }
      );
    } else {
      // setLoading(false);
      sendRequest()
    }

    // localStorage.setItem(DEVICE_ID_KEY, newId);
    localStorage.setItem("activationCode", activationCode);
    // localStorage.setItem(DEVICE_ID_KEY, newId);
    localStorage.setItem("activationCode", activationCode);
  };

  const sendRequest = async () => {
    const payload = {
      apikey: "SUBMIT",
      eventcode: activationCode,
      vstrname: userName,
      vstrnumb: phoneNumber,
      vstrfrom: orgName,
      geoloc: locationName,
      geolat: location?.latitude ?? 0,
      geolon: location?.longitude ?? 0
    };


    console.log(payload)
    try {
      const result = await sendAttendanceData(payload);
      console.log('API Response:', result);

      if (result.data[0].status === "fail") {
        toast.error(result.data[0].message)
        return;
      } else if (result.data[0].status === "success") {

        setToken(result.data[0].token)

        setShowModal(true);
        setActivationCode('')
        setUserName('')
        setPhoneNumber('')
        setOrgName('')
        setLocation(null)
        setLocationName('')

      }
      setLoading(false)
    } catch (error) {
      setLoading(false)

      console.log(error)
    }
  }

  const validateEventCode = async () => {
    const payload = { "apikey": "VALIDATE", "eventcode": activationCode };

    console.log(payload)
    try {
      const result = await sendActivationCode(payload);

      // result = {
      //   "data": [
      //     {
      //       "status": "success",
      //       "message": "Invalid Event Code",
      //       startDatetime: "2025-05-20T09:00:00",
      //       endDatetime: "2025-05-20T18:00:00"
      //     }
      //   ]
      // }


      if (result.data[0].status === "fail") {
        toast.error(result.data[0].message)
        return
      } else {
        setIsActivated(true);

        console.log("result:: ", result)
        console.log(result.data[0].startDatetime, result.data[0].endDatetime)
        setStartDatetime(result.data[0].startDatetime)
        setEndDatetime(result.data[0].endDatetime)

        toast.success("Event code is valid")
        console.log("New event added to localStorage.");
        console.log('API Response:', result);

        let events = localStorage.getItem("events") ?? "[]";

        // If events is null, initialize an empty array, otherwise parse the existing data
        if (events === null) {
          events = JSON.stringify([]); // Initialize an empty array if no events exist
        }

        const eventsArray = JSON.parse(events);
        // If event doesn't exist, add it
        eventsArray.push(result);

        // Save the updated array back to localStorage
        localStorage.setItem("events", JSON.stringify(eventsArray));

      }

    } catch (error) {
      console.log(error)
    }
  }

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

  // Function to check if the event date is in Past
  const isEventInThePast = (eventDate: string) => {
    const today = new Date();
    const eventDateObj = new Date(eventDate);
    // today.setHours(0, 0, 0, 0);
    // eventDateObj.setHours(0, 0, 0, 0);
    console.log("eventDateObj < today", eventDate, eventDateObj)
    console.log(eventDateObj)
    console.log(today)
    console.log(eventDateObj < today)
    return eventDateObj < today;
  };

  // Function to check if the event date is in the future
  const isEventInTheFuture = (eventDate: string) => {
    const today = new Date();
    const eventDateObj = new Date(eventDate);
    // today.setHours(0, 0, 0, 0);
    // eventDateObj.setHours(0, 0, 0, 0);
    console.log("eventDateObj > today")
    console.log(eventDateObj)
    console.log(today)
    console.log(eventDateObj > today)
    return eventDateObj > today;
  };

  // Function to check if the user has already submitted the event for the day
  const hasUserSubmittedForTheDay = (formattedDate: string, eventCode: string): boolean => {
    const submissionDataRaw = localStorage.getItem("lastSubmission");

    if (!submissionDataRaw) {
      console.log("No previous submission found.");
      return false;
    }

    const submissionData = JSON.parse(submissionDataRaw);

    // Check if any submission matches both the date and the event code
    const alreadySubmitted = submissionData.some((entry: { code: string; date: string; ipaddress: string }) =>
      entry.code === eventCode &&
      new Date(entry.date).toDateString() === new Date(formattedDate).toDateString()
    );

    if (alreadySubmitted) {
      console.log("User has already submitted for this event on this date.");
      return true;
    }

    console.log("No matching submission found.");
    return false;
  };


  useEffect(() => {
    // generateTokenNew("Bipin", "9967504677")
    const deviceId = uuidv4();
    // else {
    // const newId = uuidv4();
    // localStorage.setItem(DEVICE_ID_KEY, newId);
    // setDeviceId(newId);
    // }
    getFingerprint();

    console.log("deviceId:: ", deviceId)
    // console.log("visitorId:: 1 ", visitorId)
    console.log(navigator.userAgent);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        const locationName = await getLocationName(position.coords.latitude, position.coords.longitude);
        setLocationName(locationName)
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location permission denied.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location info unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out.');
            break;
          // case error.UNKNOWN_ERROR:
          //   toast.error('An unknown location error occurred.');
          //   break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }, []);


  const TokenDisplay = ({ token }: { token: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="flex flex-wrap  gap-2 mt-4 text-center sm:text-left">
        <span className="text-base sm:text-2xl font-bold text-orange-600">
          Your registration token is: <span className="break-all text-orange-800">{token}</span>
        </span>
        <div className="relative group">
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-gray-100 transition"
            aria-label="Copy token"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-600 group-hover:text-orange-600 relative -top-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h3l1-1h2l1 1h3a2 2 0 012 2v12a2 2 0 01-2 2z"
              />
            </svg>
          </button>
          {/* Tooltip */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-xs bg-gray-700 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Copy
          </div>
          {/* Copied! feedback */}
          {copied && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 text-xs bg-green-600 text-white px-2 py-1 rounded shadow whitespace-nowrap">
              Copied!
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      <div>
        <ToastContainer
          className="p-6 "
          position="bottom-center"
          autoClose={3000}
        />
      </div>
      {/* Mobile-only Top Welcome Section */}
      <div className="lg:hidden flex flex-col items-center text-center p-6 bg-white">
        <img
          src="/aparlogo_transparent.png"
          alt="Company Logo"
          className="h-25 mb-3"
        />
      </div>
      {/* Left Panel for Web View */}
      <div className="hidden lg:flex w-1/2 bg-white text-white p-10 flex-col justify-center rounded-r-[0px]">
        <div className="flex items-center space-x-4 justify-center text-center">
          <div className="bp-2 rounded-full ">
            <img src="/aparlogo_transparent.png"
              alt="Company Logo"
              className="h-35 mb-4"
            />
          </div>
        </div>
      </div>
      {/* Right Panel for Form */}
      <div className="flex-1 flex justify-center items-center p-8 bg-[#fecda5] rounded-t-[30px] lg:rounded-none lg:rounded-l-[50px]">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-2xl font-bold text-center text-orange-600">Attendance Form</h2>
          <p className="text-center text-gray-500 mb-4">
            Enter your valid information to mark attendance
          </p>
          {(
            <p className="text-sm text-red-500 mt-1 ml-2">{consoleMessage}</p>
          )}

          <div className="w-full max-w-md">
            <div className="w-full flex flex-row gap-2 items-center bg-white shadow-md rounded-lg max-w-md">
              <div className="flex items-center bg-white rounded-md py-3 w-full">
                <div className="flex items-center px-3 text-gray-400">
                  <svg
                    className={`w-5 h-5 mr-1 ${!isActivated ? 'text-black' : 'text-gray-400'}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V7.5A4.5 4.5 0 008 7.5v3M5.25 10.5h13.5a.75.75 0 01.75.75v7.5a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75v-7.5a.75.75 0 01.75-.75z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Event Code"
                  // className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
                  className={`w-full outline-none text-sm ${!isActivated ? 'text-black' : 'text-gray-400'} placeholder-gray-400`}
                  value={activationCode}
                  onChange={(e) => {
                    setShowError(false)
                    setActivationCode(e.target.value.toLocaleUpperCase());
                    if (!e.target.value.trim()) {
                      setIsActivated(false);
                    }
                  }}
                  disabled={isActivated}
                  required
                  maxLength={6}
                />
              </div>

              <button
                type="button"
                className="text-sm px-4 rounded-md
                bg-orange-600 text-white rounded-lg 
                disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-orange-600"
                style={{ height: '48px', minWidth: '80px' }}
                onClick={() => {
                  // Blur the active element (usually the input)
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }


                  if (activationCode.trim()) {

                    // setconsoleMessage(activationCode)
                    // =========================
                    let events = localStorage.getItem("lastSubmission") ?? JSON.stringify([]);

                    // If events is null, initialize an empty array, otherwise parse the existing data
                    if (events === null) {
                      events = JSON.stringify([]); // Initialize an empty array if no events exist
                    }

                    const eventsArray = JSON.parse(events); // Now it's safe to parse
                    console.log("events:: ", events, eventsArray)


                    // Check if the event already exists based on eventCode
                    // const eventExists = eventsArray.some((event: EventDetails) => {
                    //   console.log("eventsArray.some:: ", activationCode, event.eventCode)

                    //   event.eventCode === activationCode
                    // });
                    const today = new Date();
                    const dd = String(today.getDate()).padStart(2, '0');
                    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
                    const yy = String(today.getFullYear()); // Get last two digits of the year

                    const formattedDate = `${yy}-${mm}-${dd}`;
                    const eventExists = eventsArray.some((entry: { code: string; date: string }) =>
                      entry.code === activationCode &&
                      new Date(entry.date).toDateString() === new Date(formattedDate).toDateString()
                    );

                    console.log('eventExists', eventExists)
                    setconsoleMessage('eventExists')

                    if (!eventExists) {

                      // toast.success("Event code is valid")
                      console.log("New event added to localStorage.");

                      validateEventCode()

                    } else {
                      setconsoleMessage("This event already exists in localStorage.")

                      console.log("This event already exists in localStorage.", localStorage.getItem("events"));
                      toast.error("You have already submitted an event for this day.")
                    }
                    // =========================



                  } else {
                    setconsoleMessage("ELSE")
                    setShowError(true)
                  }
                }}
                disabled={isActivated}
              >
                Validate
              </button>
            </div>


            {showError && (
              <p className="text-sm text-red-500 mt-1 ml-2">Event code is required</p>
            )}

          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex items-center bg-white border rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed focus-within:ring-2 focus-within:ring-red-500">
              <svg className={`w-5 h-5 mr-3 ${isActivated ? 'text-black' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 10a4 4 0 100-8 4 4 0 000 8zM2 18a8 8 0 0116 0H2z" />
              </svg>
              <input
                type="text"
                placeholder="Visitor Name"
                className="flex-1 outline-none text-[#000] disabled:opacity-50 disabled:cursor-not-allowed"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                disabled={!isActivated}
              />
            </div>

            <div className="flex items-center bg-white border rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed focus-within:ring-2 focus-within:ring-red-500">
              <svg
                className={`w-5 h-5 mr-3 ${isActivated ? 'text-black' : 'text-gray-400'}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0-1.243 1.007-2.25 2.25-2.25h1.086c.621 0 1.193.28 1.582.762l1.3 1.623a2.25 2.25 0 01.266 2.427l-.6 1.2a11.25 11.25 0 005.652 5.652l1.2-.6a2.25 2.25 0 012.427.266l1.623 1.3c.482.389.762.96.762 1.582V19.5a2.25 2.25 0 01-2.25 2.25h-.75C9.797 21.75 2.25 14.203 2.25 5.25v-.75z"
                />
              </svg>
              <input
                type="tel"
                placeholder="Mobile No."
                className="flex-1 outline-none text-[#000] disabled:opacity-50 disabled:cursor-not-allowed"
                inputMode="numeric"
                // pattern="[0-9]*"
                value={phoneNumber}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                  const allSameDigits = /^(\d)\1{9}$/; // matches repeated digits
                  const repeatingTwoDigits = /^(\d\d)\1{4}$/;
                  if (allSameDigits.test(onlyNums)) {
                    setError('Mobile number cannot have all digits the same.');
                    return;
                  } else if (repeatingTwoDigits.test(onlyNums)) {
                    setError('Mobile number cannot repeat the same 2-digit pattern.');
                    return;
                  }
                  setPhoneNumber(onlyNums);
                }}
                required
                maxLength={10}
                minLength={10}
                disabled={!isActivated}
                pattern="^[6-9]\d{9}$"
              />
            </div>
            {/* Org/Shop Name */}
            <div className="flex items-center bg-white border rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed focus-within:ring-2 focus-within:ring-red-500">
              <svg className={`w-5 h-5 mr-3 ${isActivated ? 'text-black' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3h16v2H2V3zm1 4h14v10H3V7zm2 2v2h2V9H5zm4 0v2h2V9H9z" />
              </svg>
              <input
                type="text"
                placeholder="Org./Shop Name"
                className="flex-1 outline-none text-[#000] disabled:opacity-50 disabled:cursor-not-allowed"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                disabled={!isActivated}
              />
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isActivated ||
                loading ||
                userName.trim() === '' ||
                phoneNumber.trim().length !== 10 ||
                orgName.trim() === ''}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold 
    hover:bg-red-700 
    disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
            >
              {loading ? 'Please wait...' : 'Submit'}
            </button>
          </form>
          {locationName && (
            <div className="border border-gray-300 rounded-xl p-4 mt-0 bg-gray-100 shadow-sm space-y-2">
              <p className="text-sm text-black font-semibold justify-center text-center text-[16px] underline">Live Location</p>
              <p className="text-sm text-gray-800">
                <span className="font-medium text-gray-600">Location:</span>{' '}
                <span className="text-green-700 font-semibold">{locationName}</span>
              </p>
              {location && (
                <p className="text-sm text-gray-800">
                  <span className="font-medium text-gray-700">Coordinates:</span>{' '}
                  <span className="text-orange-700">Lat {location.latitude.toFixed(5)}</span>,
                  <span className="ml-2 text-orange-700">Lng {location.longitude.toFixed(5)}</span>
                </p>
              )}
              {(
                <p className='text-l text-black' > IP Address: <span className="text-2xl text-red-500 justify-center text-center">{visitorId}</span></p>
              )}
            </div>

          )}

          {loading && (
            <div className="flex justify-center my-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent shadow-lg"></div>
            </div>
          )}
        </div>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-60 bg-black/40 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-2xl max-w-xl w-full transform transition-all duration-300 scale-95 opacity-0 animate-fade-in">
              <div className='flex justify-center mb-4'>
                <img
                  src="/check.png"
                  alt="Company Logo"
                  className="h-30 mb-2"
                />
              </div>
              <h2 className="text-xl sm:text-3xl font-semibold text-gray-900 mb-2">
                Thank you for registering with APAR
              </h2>

              <TokenDisplay token={token} />
              <p className="text-l text-red-500 font-bold mb-2">Note: Please share this token with host.</p>
              {location && (
                <p className="text-sm text-gray-700 mt-2">
                  Location: <span className="text-green-700">Lat {location.latitude.toFixed(5)}</span>,
                  <span className="ml-2 text-green-700">Lng {location.longitude.toFixed(5)}</span>
                </p>
              )}
              {locationName && (
                <p className="text-sm text-gray-700 mt-1">
                  Location: <span className="text-green-700">{locationName}</span>
                </p>
              )}
              <button
                onClick={() => {
                  setShowModal(false)
                  setIsActivated(false);
                  setToken('')

                }}
                className="mt-4 w-full bg-orange-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import toast, { Toaster } from 'react-hot-toast';

const Popup = () => {
  const [status, setStatus] = useState('Ready');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Check login status on mount
  useEffect(() => {
    chrome.storage.local.get(['authToken'], (result) => {
      if (result.authToken) {
        setIsLoggedIn(true);
        fetchJobs(result.authToken);
      }
    });
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    try {
      setIsProcessing(true);
      setStatus('Logging in...');

      chrome.runtime.sendMessage({
        type: 'LOGIN',
        data: { username, password }
      }, (response) => {
        if (response.success) {
          setIsLoggedIn(true);
          fetchJobs(response.token);
          setStatus('Logged in successfully!');
          toast.success('Successfully logged in!');
        } else {
          setStatus(`Login Error: ${response.error}`);
          toast.error(response.error);
        }
        setIsProcessing(false);
      });
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      toast.error(error.message);
      setIsProcessing(false);
    }
  };

  const fetchJobs = async (token) => {
    try {
      setStatus('Fetching jobs...');
      chrome.runtime.sendMessage({
        type: 'FETCH_JOBS',
        data: { token }
      }, (response) => {
        if (response.success) {
          setJobs(response.jobs);
          setStatus(`Found ${response.jobs.length} jobs`);
          toast.success(`Found ${response.jobs.length} jobs`);
        } else {
          setStatus(`Error fetching jobs: ${response.error}`);
          toast.error(response.error);
        }
      });
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      toast.error(error.message);
    }
  };

  const handleApplyToJobs = async () => {
    if (jobs.length === 0) {
      toast.error('No jobs available to apply');
      return;
    }

    try {
      setIsProcessing(true);
      setStatus('Starting application process...');

      chrome.runtime.sendMessage({
        type: 'APPLY_TO_JOBS',
        data: { jobs }
      }, (response) => {
        if (response.success) {
          setStatus('Applications submitted successfully!');
          toast.success('All applications submitted!');
          if (response.errors?.length > 0) {
            response.errors.forEach(error => toast.error(error));
          }
        } else {
          setStatus(`Error: ${response.error}`);
          toast.error(response.error);
        }
        setIsProcessing(false);
      });
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      toast.error(error.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-w-[400px] bg-gray-50 min-h-[400px] flex flex-col">
      <Toaster position="bottom-center" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#14a800] to-[#1a8917] text-white px-6 py-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <img 
            src="https://www.upwork.com/favicon.ico" 
            alt="Upwork" 
            className="w-8 h-8"
          />
          <div>
            <h2 className="text-xl font-bold">Upwork Assistant</h2>
            <p className="text-sm opacity-90">Auto Job Application</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        <Transition
          show={!isLoggedIn}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Login Form */}
          <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Login to Continue</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-3/4 p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14a800] focus:border-transparent transition-all duration-200"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-3/4 p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14a800] focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={isProcessing}
              className={`w-3/4 py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                isProcessing
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-[#14a800] text-white hover:bg-[#14a800]/90'
              }`}
            >
              {isProcessing && (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              )}
              <span>{isProcessing ? 'Logging in...' : 'Login'}</span>
            </button>
          </div>
        </Transition>

        <Transition
          show={isLoggedIn}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Jobs List and Application */}
          <div className="space-y-4">
            {jobs.length > 0 && (
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Available Jobs ({jobs.length})
                </h3>
                <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 break-all">
                        {job.url}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleApplyToJobs}
              disabled={isProcessing || jobs.length === 0}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                isProcessing || jobs.length === 0
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-[#14a800] text-white hover:bg-[#14a800]/90'
              }`}
            >
              {isProcessing && (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              )}
              <span>
                {isProcessing 
                  ? 'Processing Applications...' 
                  : `Apply to ${jobs.length} Jobs`}
              </span>
            </button>
          </div>
        </Transition>

        {/* Status Card */}
        <div className={`p-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
          status.includes('Error') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : status.includes('success')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {status.includes('Error') ? (
            <XCircleIcon className="w-5 h-5 text-red-500" />
          ) : status.includes('success') ? (
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
          ) : (
            <ArrowPathIcon className="w-5 h-5 text-blue-500" />
          )}
          <span className="text-sm font-medium">{status}</span>
        </div>
      </div>

      {/* Footer */}
     
    </div>
  );
};

export default Popup; 
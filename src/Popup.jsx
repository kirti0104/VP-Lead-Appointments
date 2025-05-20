import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import toast, { Toaster } from 'react-hot-toast';


const Popup = () => {
  const [status, setStatus] = useState('Ready');
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobs, setJobs] = useState([]);

  // Load mock jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      setStatus('Fetching jobs...');
      setIsProcessing(true);
      try {
        const response = await fetch('http://localhost:4055/api/v1/users-with-pitches');
        const data = await response.json();
        setJobs(data.data); // data.data is the array of jobs
        setStatus(`Found ${data.data.length} jobs`);
      } catch (error) {
        setStatus('Error fetching jobs');
        setJobs([]);
      }
      setIsProcessing(false);
    };

    fetchJobs();
  }, []);

  const handleJobClick = async (job) => {
    try {
      setStatus('Loading job details...');
      setIsProcessing(true);

      // Get the first pitch (or however you want to select)
      const pitch = job.userPitches && job.userPitches.length > 0
        ? job.userPitches[0].pitchText
        : '';

      // Prepare the object for the content script
      const jobDetails = {
        pitch,
        // Add more fields if needed for dynamic questions
      };

      await chrome.storage.local.set({ currentJobDetails: jobDetails });
      chrome.tabs.create({ url: job.jobUrl });
      setStatus('Job details loaded!');
      toast.success('Opening job page...');
      setIsProcessing(false);
    } catch (error) {
      console.error('Error in handleJobClick:', error);
      toast.error(error.message);
      setStatus('Error loading job details');
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-[400px] max-w-full mx-auto bg-gray-50 min-h-[500px] flex flex-col rounded-lg shadow-lg">
      <Toaster position="bottom-center" />
      {/* Header */}
      <div className="bg-[#f9f9f9] text-black py-2 px-28 shadow-md flex ">
        <div className="flex items-center space-x-3">
          <img 
            src="sD-logo.png" 
            alt="smartData Enterprises" 
            className="w-32 h-16 object-contain"
          />
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 px-6 py-6 space-y-6">
        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Latest Jobs ({jobs.length})
              </h3>
              <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-200">
                {jobs.map((job) => (
                  <div
                    key={job.jobPostId}
                    onClick={() => handleJobClick(job)}
                    className="p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  >
                    <h4 className="font-medium text-gray-900">{job.jobTitle}</h4>
                    {/* <p className="text-sm text-gray-600 mt-1">{job.jobDescription}</p> */}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
    </div>
  );
};

export default Popup; 
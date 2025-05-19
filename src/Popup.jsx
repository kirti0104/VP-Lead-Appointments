import React, { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import toast, { Toaster } from 'react-hot-toast';
import { mockJobs, getMockJobDetails } from './mockData';

const Popup = () => {
  const [status, setStatus] = useState('Ready');
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobs, setJobs] = useState([]);

  console.log("mockjobs", mockJobs);

  // Load mock jobs on mount
useEffect(() => {
  setJobs(mockJobs);
  setStatus(`Found ${mockJobs.length} jobs`);
  console.log("mockJobs inside useEffect:", mockJobs);  // ✅ THIS IS BEST PLACE TO LOG
}, []);

  const handleJobClick = async (job) => {
    console.log("handleJobClick");
    debugger;
    try {
      console.log("Hello-----------------------",)
      setStatus('Loading job details...');
      setIsProcessing(true);

      // Get mock job details
      const jobDetails = getMockJobDetails(job.id);

    console.log("entering job details");
      await chrome.storage.local.set({ 
        currentJobDetails: jobDetails 
      });
      chrome.tabs.create({ url: job.url }, (tab) => {
  // Optional: wait a bit for content script to be ready
  setTimeout(() => {
    chrome.runtime.sendMessage({
      type: 'FILL_APPLICATION',
      data: jobDetails
    });
  }, 2000); // 2s delay to allow page & content script to load
});
      // Open job URL in new tab
      chrome.tabs.create({ url: job.url });
      setStatus('Job details loaded!');
      toast.success('Opening job page...');
      setIsProcessing(false);
    } catch (error) {
      console.error('Error in handleJobClick:', error);
      toast.error(error.message);
      setStatus('Error: ' + error.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-w-[400px] bg-gray-50 min-h-[400px] flex flex-col">
      <Toaster position="bottom-center" />
      
      {/* Header */}
      <div className="bg-[#f9f9f9] text-black py-2 px-28 shadow-md flex ">
        <img 
          src="sD-logo.png" 
          alt="smartData Enterprises" 
          className="w-42 h-16 object-contain"
        />
      </div>


      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Latest Jobs ({jobs.length})
              </h3>
              <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-200">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => handleJobClick(job)}
                    className="p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  >
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {job.description}
                    </p>
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
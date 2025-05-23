import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { TrashIcon, ArrowPathIcon as RefreshIcon } from '@heroicons/react/24/solid';
import config from './config';
import axios from 'axios';
import { generateJobTitleFromPitch } from './utils/pitchUtils';


const Popup = () => {
  const [status, setStatus] = useState('Ready');
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobs, setJobs] = useState([]);

  // Fetch jobs from API
  const fetchJobs = useCallback(async () => {
    setStatus('Fetching jobs...');
    setIsProcessing(true);
    console.log("Fetching jobs from API");
  
    try {
      const response = await axios.get(`${config.BASE_URL}/getAllPitches`);
      const pitches = response.data.pitches || [];
      const transformedJobs = pitches.map((pitch) => {
        const jobId = pitch.jobId;
        // const jobUrl = `https://www.upwork.com/jobs/~${jobId}`;
        const proposalUrl = `https://www.upwork.com/nx/proposals/job/~${jobId}/apply`;

  
        return {
          jobPostId: pitch.id,
          jobId: jobId,
          jobUrl: proposalUrl,
          jobTitle: generateJobTitleFromPitch(pitch.generatedPitch),
          userPitches: [{ pitchText: pitch.generatedPitch }],
          proposalUrl: proposalUrl,
        };
      });
  
      setJobs(transformedJobs);
      setStatus(`Found ${transformedJobs.length} jobs`);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setStatus('Error fetching jobs');
      setJobs([]);
    }
  
    setIsProcessing(false);
  }, []);
  

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleJobClick = async (job) => {
    try {
      setStatus('Loading job details...');
      setIsProcessing(true);
      const pitch = job.userPitches && job.userPitches.length > 0
        ? job.userPitches[0].pitchText
        : '';
      const jobDetails = { pitch };
      await chrome.storage.local.set({ currentJobDetails: jobDetails });;
      chrome.tabs.create({ url:job.proposalUrl });
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

  const handleDeleteJob = async (jobPostId) => {
    setJobs((prevJobs) => prevJobs.filter(job => job.jobPostId !== jobPostId));
    // Optionally, add backend call to hide/delete job
  };

  return (
    <div className="w-[400px] max-w-full mx-auto bg-gray-50 min-h-[500px] flex flex-col rounded-lg shadow-lg">
      <Toaster position="bottom-center" />
      {/* Header */}
      <div className="bg-[#f9f9f9] text-black py-2 px-6 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="sD-logo.png" 
            alt="smartData Enterprises" 
            className="w-32 h-16 object-contain"
          />
        </div>
        
                <button
          onClick={fetchJobs}
          disabled={isProcessing}
          title="Refresh Jobs"
          className="p-1 rounded-full bg-transparent hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshIcon
            className={`text-gray-700 ${isProcessing ? 'animate-spin' : ''}`}
            style={{ width: '24px', height: '24px' }}
          />
        </button>

      

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
              <div className=" max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-200">
                {jobs.map((job) => (
                  <div className="flex items-start justify-between flex-wrap gap-2 p-4 hover:bg-gray-50 transition-colors duration-150" key={job.jobPostId}>
                    <div
                      onClick={() => handleJobClick(job)}
                      className="cursor-pointer flex-1"
                    >
                      <h4
                        className="font-medium text-gray-900 text-sm leading-snug line-clamp-2"
                        title={job.jobTitle}
                      >
                        {job.jobTitle}
                      </h4>
                    </div>
                    <a
                      href={job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Browse Job"
                      onClick={() => handleJobClick(job)}
                      className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 mt-1"
                    >
                      <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                    </a>
                    <button
                      type="button"
                      title="Remove Job"
                      onClick={() => handleDeleteJob(job.jobPostId)}
                      className="appearance-none p-0 border-0 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center mt-1 ml-2"
                    >
                      <TrashIcon className="w-5 h-5 text-white" />
                    </button>
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
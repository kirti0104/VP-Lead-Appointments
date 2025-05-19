const debug = (message) => {
  if (process.env.NODE_ENV === 'development') {
    chrome.storage.local.get(['debug'], (result) => {
      if (result.debug) {
        chrome.storage.local.get(['logs'], (result) => {
          const logs = result.logs || [];
          logs.push({
            timestamp: new Date().toISOString(),
            type: 'background',
            message
          });
          chrome.storage.local.set({ logs });
        });
      }
    });
  }
};

// Debug logging
debug('Background script loaded');

const API_BASE_URL = 'YOUR_TEAMS_API_URL';

const apiCall = async (endpoint, method = 'GET', data = null, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
      body: data ? JSON.stringify(data) : null
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'API call failed');
    }

    return responseData;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'LOGIN') {
    handleLogin(request.data, sendResponse);
    return true;
  }

  if (request.type === 'FETCH_JOBS') {
    handleFetchJobs(request.data, sendResponse);
    return true;
  }

  if (request.type === 'GET_JOB_DETAILS') {
    handleGetJobDetails(request.data, sendResponse);
    return true;
  }
});

// Handle login
async function handleLogin(data, sendResponse) {
  try {
    const response = await apiCall('/auth/login', 'POST', {
      username: data.username,
      password: data.password
    });

    // Store token
    await chrome.storage.local.set({ authToken: response.token });

    sendResponse({ success: true, token: response.token });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Update job fetching to get 10 newest jobs
async function handleFetchJobs(data, sendResponse) {
  try {
    const response = await apiCall('/jobs/newest?limit=10', 'GET', null, data.token);
    sendResponse({ success: true, jobs: response.jobs });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Add new function to handle job details
async function handleGetJobDetails(data, sendResponse) {
  try {
    const response = await apiCall(`/jobs/${data.jobId}`, 'GET', null, data.token);
    sendResponse({ success: true, jobDetails: response });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Handle job applications
async function handleJobApplications(data, sendResponse) {
  try {
    let successCount = 0;
    const errors = [];

    for (const job of data.jobs) {
      try {
        // Get pitch for this job
        const pitchResponse = await apiCall('/pitch', 'POST', {
          jobId: job.id
        }, data.token);

        // Open job in new tab and apply
        const tab = await chrome.tabs.create({ 
          url: job.url,
          active: false
        });

        // Wait for page to load and fill form
        await chrome.tabs.sendMessage(tab.id, {
          type: 'FILL_APPLICATION',
          data: {
            pitch: pitchResponse.pitch
          }
        });

        // Submit application data back to API
        await apiCall('/applications', 'POST', {
          jobId: job.id,
          status: 'applied'
        }, data.token);

        successCount++;
        
        // Close tab after application
        chrome.tabs.remove(tab.id);
      } catch (error) {
        errors.push(`Error with job ${job.id}: ${error.message}`);
      }
    }

    sendResponse({
      success: true,
      message: `Successfully applied to ${successCount} jobs`,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
} 
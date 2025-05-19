console.log('content script loaded');

// Debug function that only logs in development mode
const debug = (message) => {
  if (process.env.NODE_ENV === 'development') {
    chrome.storage.local.get(['debug'], (result) => {
      if (result.debug) {
        // Store in extension's log storage instead of console
        chrome.storage.local.get(['logs'], (result) => {
          const logs = result.logs || [];
          logs.push({
            timestamp: new Date().toISOString(),
            type: 'content',
            message
          });
          chrome.storage.local.set({ logs });
        });
      }
    });
  }
};

// Function to wait for an element to appear on the page
const waitForElement = (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(`Timeout waiting for ${selector}`);
    }, timeout);
  });
};

// Fill a text field with given value
const fillTextField = async (selector, text) => {
  try {
    const element = await waitForElement(selector);
    if (element) {
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
  } catch (error) {
    console.error(`Error filling field: ${error}`);
    return false;
  }
};

function setNativeValue(element, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(element.__proto__, 'value').set;
  valueSetter.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

// Fill the application form with job details
const fillApplicationForm = async (jobDetails) => {
  try {
    console.log('Looking for cover letter field...');
    let coverLetterField =
      await waitForElement('textarea[aria-labelledby="cover_letter_label"]')
      || await waitForElement('textarea[name="coverLetter"]')
      || await waitForElement('textarea.air3-textarea.inner-textarea')
      || await waitForElement('textarea');
    console.log('Found cover letter field:', coverLetterField);
    if (coverLetterField) {
      setNativeValue(coverLetterField, jobDetails.pitch);
      
      // Fill dynamic questions if they exist
      if (jobDetails.questions && jobDetails.questions.length > 0) {
        for (const question of jobDetails.questions) {
          const questionElement = await waitForElement(`[data-question-id="${question.id}"]`);
          if (questionElement) {
            await fillTextField(`[data-question-id="${question.id}"]`, question.answer);
          }
        }
      }

      return { success: true };
    } else {
      throw new Error('Cover letter field not found');
    }
  } catch (error) {
    console.error('Error filling application:', error);
    return { success: false, error: error.message };
  }
};

window.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM fully loaded");
  if (window.location.href.includes('upwork.com/nx/proposals/job/')) {
    const { currentJobDetails } = await chrome.storage.local.get(['currentJobDetails']);
    if (currentJobDetails) {
      console.log('Found currentJobDetails:', currentJobDetails);
      await fillApplicationForm(currentJobDetails);
      await chrome.storage.local.remove(['currentJobDetails']);
    } else {
      console.log('No currentJobDetails found');
    }
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FILL_APPLICATION') {
    fillApplicationForm(request.data)
      .then(sendResponse)
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

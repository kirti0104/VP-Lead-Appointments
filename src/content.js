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

// Fill the application form
const fillApplicationForm = async (pitch) => {
  try {
    // Wait for the cover letter field
    const coverLetterField = await waitForElement('textarea[aria-label="Cover Letter"]');
    if (coverLetterField) {
      // Fill cover letter
      await fillTextField('textarea[aria-label="Cover Letter"]', pitch);
      
      // Submit form if needed
      const submitButton = document.querySelector('button[type="submit"]');
      if (submitButton) {
        // Uncomment the next line if you want to auto-submit
        // submitButton.click();
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

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FILL_APPLICATION') {
    fillApplicationForm(request.data.pitch)
      .then(sendResponse)
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements Initialization
  const messageElement = document.getElementById('message');
  const segmentSelect = document.getElementById('segment-select');
  const passwordSection = document.getElementById('password-section');
  const passwordInput = document.getElementById('password');
  const submitButton = document.getElementById('submit-btn');
  const useRootPasswordCheckbox = document.getElementById('use-root-password');
  let segmentsData = [];

  // Application Initialization
  try {
    const statusResult = await get_status();

    if (statusResult.status === 'ok') {
      const listResult = await get_list();

      if (listResult.status !== 'ok') {
        messageElement.textContent = handleError(listResult.status);
        return;
      }

      segmentsData = listResult.segments;

      if (segmentsData && segmentsData.length > 0) {
        segmentSelect.style.display = 'block';
        segmentsData.forEach(segment => {
          const option = document.createElement('option');
          option.value = segment.name;
          option.textContent = segment.name;
          segmentSelect.appendChild(option);
        });
      } else {
        messageElement.textContent = 'No segments available.';
      }
    } else {
      messageElement.textContent = handleError(statusResult.status);
    }
  } catch (error) {
    console.error('Error:', error);
    messageElement.textContent = 'An error occurred while retrieving data. Please try again later.';
  }

  // Segment Selection Handler
  segmentSelect.addEventListener('change', () => {
    const selectedSegmentName = segmentSelect.value;
    const selectedSegment = segmentsData.find(segment => segment.name === selectedSegmentName);
    if (selectedSegment && selectedSegment.data_type === 'encrypted') {
      passwordSection.style.display = 'block';
    } else {
      passwordSection.style.display = 'none';
    }
  });

  // Form Submission Handler
  async function onSubmit() {
    messageElement.textContent = '';

    const selectedSegmentName = segmentSelect.value;

    if (!selectedSegmentName) {
      messageElement.textContent = 'Please select a segment.';
      return;
    }

    const selectedSegment = segmentsData.find(segment => segment.name === selectedSegmentName);
    const password = selectedSegment && selectedSegment.data_type === 'encrypted' ? passwordInput.value : undefined;
    const useRootPassword = useRootPasswordCheckbox.checked;

    try {
      const data = await get_data(selectedSegmentName, password, useRootPassword);

      if (data.status !== 'ok') {
        messageElement.textContent = handleError(data.status);
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "insertPassword", password: data.data });
          window.close();
        });
      }
    } catch (error) {
      console.error('Error:', error);
      messageElement.textContent = 'An error occurred while decrypting data. Please try again later.';
    }
  }

  // Event Listeners for Submission
  submitButton.addEventListener('click', onSubmit);
  passwordInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      onSubmit();
    }
  });

  // Error Handling Utility
  function handleError(errorCode) {
    const errorMessages = {
      'ok': 'System is operational.',
      'device_not_found': 'Device not found.',
      'device_error': 'There was an issue accessing the device.',
      'password_error': 'There was an error with the provided password.',
      'error_decode_password': 'Failed to decode password.',
      'password_not_provided': 'Password not provided.',
      'data_not_found': 'The requested data was not found.',
      'error_read_data': 'There was an error reading the data.',
      'default': 'An unknown error occurred.'
    };

    return errorMessages[errorCode] || errorMessages['default'];
  }
});

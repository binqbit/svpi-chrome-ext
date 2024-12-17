document.addEventListener('DOMContentLoaded', async () => {
  const messageElement = document.getElementById('message');
  const segmentSelect = document.getElementById('segment-select');
  const passwordSection = document.getElementById('password-section');
  let segmentsData = [];

  try {
    const statusResult = await status();

    if (statusResult.status === 'ok') {
      const listResult = await list();

      if (listResult.error) {
        messageElement.textContent = handleError(listResult.error);
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

  segmentSelect.addEventListener('change', () => {
    const selectedSegmentName = segmentSelect.value;
    const selectedSegment = segmentsData.find(segment => segment.name === selectedSegmentName);
    if (selectedSegment && selectedSegment.data_type === 'encrypted') {
      passwordSection.style.display = 'block';
    } else {
      passwordSection.style.display = 'none';
    }
  });

  async function onSubmit() {
    messageElement.textContent = '';

    const selectedSegmentName = segmentSelect.value;

    if (!selectedSegmentName) {
      messageElement.textContent = 'Please select a segment.';
      return;
    }

    const selectedSegment = segmentsData.find(segment => segment.name === selectedSegmentName);
    const passwordInput = document.getElementById('password');
    const password = selectedSegment && selectedSegment.data_type === 'encrypted' ? passwordInput.value : undefined;
    const useRootPassword = document.getElementById('use-root-password').checked;

    try {
      const data = await get(selectedSegmentName, password, useRootPassword);

      if (data.error) {
        messageElement.textContent = handleError(data.error);
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

  document.getElementById('submit-btn').addEventListener('click', onSubmit);
  document.getElementById('password').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      onSubmit();
    }
  });

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
import { async } from 'regenerator-runtime';
import { TIMEOUT_SEC } from './config.js';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (
  url,
  uploadData = undefined,
  method = 'GET'
) {
  try {
    const fetchOptions = {
      method: uploadData ? 'POST' : method, // Use POST if data, otherwise use provided method
      headers: {},
    };

    if (uploadData) {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(uploadData);
    }

    // Add this condition for DELETE method
    if (method === 'DELETE') {
      fetchOptions.method = 'DELETE';
    }

    const token = localStorage.getItem('token');
    if (token) fetchOptions.headers['x-auth-token'] = token;

    const res = await Promise.race([
      fetch(url, fetchOptions),
      timeout(TIMEOUT_SEC),
    ]);

    // For DELETE requests, there might not be a JSON body to parse
    if (res.status === 204 || (res.status === 200 && method === 'DELETE'))
      return;
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message || data.msg} (${res.status})`);
    return data;
  } catch (err) {
    throw err;
  }
};

/*
export const getJSON = async function (url) {
  try {
    const fetchPro = fetch(url);
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw err;
  }
};

export const sendJSON = async function (url, uploadData) {
  try {
    const fetchPro = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadData),
    });

    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw err;
  }
};
*/

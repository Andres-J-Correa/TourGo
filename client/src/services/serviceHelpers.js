/**
 * Will unpack the response body from reponse object
 * @param {*} response
 *
 */
const onGlobalSuccess = (response) => {
  /// Should not use if you need access to anything other than the data
  return response.data;
};

const onGlobalError = (err) => {
  var errors = "Unknown";
  if (err && err.response && err.response.data && err.response.data.errors) {
    errors = err.response.data.errors;
  } else if (err.response && err.response.status) {
    errors = err.response.status;
  }
  err.appErrors = errors;
  return Promise.reject(err);
};

const API_HOST_PREFIX = process.env.REACT_APP_API_HOST_PREFIX;

export { onGlobalError, onGlobalSuccess, API_HOST_PREFIX };

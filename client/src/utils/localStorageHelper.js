const _localStorage = localStorage;

/**
 * get string by key from local
 * @param {string} key
 */
export const getStringFromLocalStorage = (key) => {
  if (!key) {
    return null;
  }
  const string = _localStorage.getItem(key);
  return string;
};

/**
 * set a string in local storage
 * @param {string} key
 * @param {string} val
 */
export const setStringInLocalStorage = (key, val) => {
  if (!key || !val) {
    return null;
  }
  _localStorage.setItem(key, val);
};

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

/**
 * get form (deserialized object) for create queue question from local storage
 * @returns {object} returns deserialized form as object
 */
export const getLocalStorageForm = (key) => {
  const storedForm = _localStorage.getItem(key);
  if (!!storedForm) {
    const deserializedForm = JSON.parse(storedForm);
    return deserializedForm;
  }
  return null;
};

/**
 * set form in local storage -- this fx stringifies the object before insert into local
 * @param {object} formObj
 */
export const setLocalStorageForm = (key, formObj) => {
  _localStorage.setItem(key, JSON.stringify(formObj));
};

/**
 * remove entry in local storage
 */
export const removeItemFromLocalStorage = (key) =>
  _localStorage.removeItem(key);

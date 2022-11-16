// Need to be in a pub/sub way so that any setter in one component
// can also trigger changes in other components, otherwise those
// will have stale data.

import { useCallback, useEffect, useState } from "react";

const subs = {};
const subscribe = (key, callback) => {
  subs[key] = subs[key] || [];
  subs[key].push(callback);
  return () => {
    subs[key] = subs[key] || [];
    subs[key] = subs[key].filter((cb) => cb !== callback);
  };
};

const encode = (obj) => JSON.stringify(obj);
const decode = (str) => (str ? JSON.parse(str) : null);

/**
 * A React Hook to use localStorage as a primary data store with a syntax similar to useState:
 *
 * ```js
 * import useStorage from "use-storage";
 * export default LogoutLink = () => {
 *   const [value, setValue] = useStorage("username");
 *   const onClick = e => setValue(undefined);
 *   return <a onClick={onClick}>Logout {value}</a>;
 * };
 * ```
 */
export default function useStorage(key) {
  const localValue = localStorage.getItem(key);
  const [state, setState] = useState(() => decode(localValue));
  const data = encode(state) === localValue ? state : decode(localValue);

  const updateSubs = (oldValue, newValue) => {
    if (typeof newValue === "function") {
      newValue = newValue(oldValue);
    }

    // Encode it once and use it for both the comparison and the setter
    const newEncodedValue = encode(newValue);

    // This way we don't trigger updates. Only in the local one, which
    // will not trigger since we return the same one
    if (encode(oldValue) === newEncodedValue) return oldValue;

    // Actually save it into localStorage
    localStorage.setItem(key, newEncodedValue);

    // This will trigger itself as well, since we're subscribed!
    subs[key].forEach((cb) => cb(newValue));
  };

  // We need to make it a callback to receive the old value without much fuzz,
  // however that means that we are double-calling setState(); once in the subs
  // and another with the return value. So in the subs we filter out this local
  // subscription, and then call it only with the return value
  const updateMemoSubs = useCallback(
    (newValue) => updateSubs(data, newValue),
    [key, data, setState]
  );

  // Subscribe this to the key, so every time the key changes we will
  // trigger an update of the state to the new value
  useEffect(() => subscribe(key, setState), [key]);

  return [data, updateMemoSubs];
}

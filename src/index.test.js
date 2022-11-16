import React, { useState } from "react";
import $ from "react-test";
import useStorage from "./";

const ClickToIncrement = ({ fn }) => {
  const [value = 0, setValue] = useStorage("key");
  fn("value-" + value);
  return <button onClick={() => setValue(value + 1)}>ok</button>;
};

const encode = (str) => JSON.stringify(str);

describe("useStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("can read a simple state", () => {
    const fn = jest.fn();
    localStorage.setItem("key", encode(0));
    $(<ClickToIncrement fn={fn} />);
    expect(fn).toBeCalledWith("value-0");
    expect(fn.mock.calls.length).toBe(1);
  });

  it("can update the state", async () => {
    const fn = jest.fn();
    localStorage.setItem("key", encode(0));
    const demo = $(<ClickToIncrement fn={fn} />);
    expect(fn).toBeCalledWith("value-0");
    expect(fn.mock.calls.length).toBe(1);

    await demo.click();

    expect(fn).toBeCalledWith("value-1");
    expect(fn.mock.calls.length).toBe(2);
  });

  it("syncs the state with other components", async () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    localStorage.setItem("key", encode(0));
    const demo = $(
      <div>
        <ClickToIncrement fn={fn1} />
        <ClickToIncrement fn={fn2} />
      </div>
    );
    expect(fn1).toBeCalledWith("value-0");
    expect(fn2).toBeCalledWith("value-0");
    expect(fn1.mock.calls.length).toBe(1);
    expect(fn2.mock.calls.length).toBe(1);
    await demo.find("button:first-child").click();
    expect(fn1).toBeCalledWith("value-1");
    expect(fn2).toBeCalledWith("value-1");
    expect(fn1.mock.calls.length).toBe(2);
    expect(fn2.mock.calls.length).toBe(2);
  });

  it("keeps keys and values updated", async () => {
    const ClickToIncrementKeys = ({ fn }) => {
      const [key, setKey] = useState(0);
      const [value] = useStorage("key-" + key);
      fn("key-" + key, "value-" + value);
      return <button onClick={() => setKey(key + 1)}>ok</button>;
    };

    const fn = jest.fn();
    localStorage.setItem("key-0", encode(0));
    localStorage.setItem("key-1", encode(1));
    const demo = $(<ClickToIncrementKeys fn={fn} />);
    expect(fn).toBeCalledWith("key-0", "value-0");
    expect(fn.mock.calls.length).toBe(1);

    await demo.click();

    expect(fn).toBeCalledWith("key-1", "value-1");
    expect(fn.mock.calls.length).toBe(2);
  });
});

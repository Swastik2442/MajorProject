import { useState, useEffect } from "react";

export const useTypingEffect = (
  text: string,
  speed = 70,
  start = true
) => {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!start) return; // only start when allowed
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayed((prev) => prev + text.charAt(index));
        setIndex((prev) => prev + 1);
      }, speed);
      return () => {clearTimeout(timeout)};
    }
  }, [index, text, speed, start]);

  return displayed;
};

export default useTypingEffect;

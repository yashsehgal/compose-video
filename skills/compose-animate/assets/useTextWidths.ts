import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";

import { INTER_VAR } from "./fonts";

export type TextSpec = { text: string; weight: number; size: number };

/**
 * The 1x widths of the card's strings, measured once Inter has loaded, so
 * the badge after the title and every button's width are known before the
 * first frame. Until then it returns null and the page stays blank.
 */
export const useTextWidths = <K extends string>(specs: Record<K, TextSpec>) => {
  const [widths, setWidths] = useState<Record<K, number> | null>(null);
  const [handle] = useState(() => delayRender("Measuring the card's text"));

  useEffect(() => {
    const entries = Object.entries(specs) as [K, TextSpec][];
    const fonts = entries.map(
      ([, s]) => `${s.weight} ${s.size}px "${INTER_VAR}"`,
    );
    Promise.all(fonts.map((font) => document.fonts.load(font))).then(() => {
      const context = document.createElement("canvas").getContext("2d")!;
      const result = {} as Record<K, number>;
      entries.forEach(([key, s], index) => {
        context.font = fonts[index]!;
        result[key] = context.measureText(s.text).width;
      });
      setWidths(result);
      continueRender(handle);
    });
    // The specs are module constants; measure once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return widths;
};

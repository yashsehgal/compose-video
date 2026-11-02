import { loadFont as loadHand } from "@remotion/google-fonts/GloriaHallelujah";
import { loadVariableFont as loadInterVariable } from "@remotion/google-fonts/Inter";

/**
 * Inter on its variable axis: any weight from 100 to 900, so a weight
 * change (500 → 350) can tween instead of snapping between two files.
 * Swap in the product's own UI face if it has a variable cut.
 */
export const INTER_VAR = loadInterVariable("normal", {
  subsets: ["latin"],
}).fontFamily;

/** The hand for the notes drawn over the component. */
export const HAND = loadHand("normal", {
  subsets: ["latin"],
}).fontFamily;

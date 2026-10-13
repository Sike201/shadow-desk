import type { CSSProperties, ReactElement } from "react";

export type DitherProps = {
  waveSpeed?: number;
  waveFrequency?: number;
  waveAmplitude?: number;
  waveColor?: string | number[];
  backgroundColor?: string | number[];
  colorNum?: number;
  pixelSize?: number;
  disableAnimation?: boolean;
  enableMouseInteraction?: boolean;
  mouseRadius?: number;
  ditherMode?:
    | "bayer"
    | "bayer4"
    | "bayer2"
    | "halftone"
    | "lines"
    | "crosshatch"
    | "noise"
    | "none";
  palette?: string[];
  scale?: number;
  contrast?: number;
  brightness?: number;
  mouseEffect?: "erase" | "reveal" | "ripple";
  mouseStrength?: number;
  trail?: number;
  clickRipple?: boolean;
  intro?: boolean;
  dpr?: number;
  className?: string;
  style?: CSSProperties;
};

declare function Dither(props: DitherProps): ReactElement;
export default Dither;

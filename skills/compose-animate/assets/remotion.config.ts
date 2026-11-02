import { Config } from "@remotion/cli/config";

// 4K: the 1920×1080 composition drawn at twice the pixel density, so every
// stroke and glyph is rasterised at 3840×2160 rather than upscaled.
Config.setScale(2);

// Lossless frames, then H.264 as close to lossless as players still accept.
Config.setVideoImageFormat("png");
Config.setCodec("h264");
Config.setCrf(1);
Config.setX264Preset("slow");
Config.setPixelFormat("yuv420p");
// Tag the colour space, so QuickTime and browsers show the same colours
// the frames were drawn in instead of guessing.
Config.setColorSpace("bt709");

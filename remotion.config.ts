import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setChromiumOpenGlRenderer('angle');
// Les images de transition (glitch, flou de mouvement) sont lourdes : délai de rendu plus large
Config.setDelayRenderTimeoutInMilliseconds(120000);

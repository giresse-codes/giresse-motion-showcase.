import {loadFont as loadMontserrat} from '@remotion/google-fonts/Montserrat';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';

const display = loadMontserrat('normal', {weights: ['600', '700', '800', '900'], subsets: ['latin', 'latin-ext']});
const body = loadInter('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin', 'latin-ext']});

export const fonts = {display: display.fontFamily, body: body.fontFamily};

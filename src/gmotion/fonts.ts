import {loadFont as loadInter} from '@remotion/google-fonts/Inter';

// Une seule famille, Inter : titres en SemiBold, textes en Regular / Medium.
const inter = loadInter('normal', {weights: ['400', '500', '600'], subsets: ['latin', 'latin-ext']});

export const fonts = {display: inter.fontFamily, body: inter.fontFamily, mono: '"JetBrains Mono", "SFMono-Regular", Menlo, monospace'};

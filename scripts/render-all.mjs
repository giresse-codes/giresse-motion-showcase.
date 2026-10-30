// Exporte toutes les compositions en MP4 dans le dossier out/.
// Usage : npm run render:all   (options supplémentaires : npm run render:all -- --scale=0.5)
import {execSync} from 'node:child_process';

const videos = ['MotionDesignPromo', 'WebDevPromo', 'CodingPromo'];
const formats = [
	['Vertical', '9x16'],
	['Landscape', '16x9'],
];
const extra = process.argv.slice(2).join(' ');

for (const video of videos) {
	for (const [suffix, label] of formats) {
		const id = `${video}-${suffix}`;
		console.log(`\n▶ Rendu de ${id}…`);
		execSync(`npx remotion render ${id} out/${video}-${label}.mp4 ${extra}`, {stdio: 'inherit'});
	}
}
console.log('\n✔ Toutes les vidéos sont dans out/');

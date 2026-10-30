import React from 'react';
import type {VideoScript} from '../config';

type Props = {script: VideoScript; width: number; height: number};

// Versions « avant » volontairement basiques, typiques des visuels d'entreprises locales.

const WebBefore: React.FC<Props> = ({script, width, height}) => {
	const compact = width < 800;
	return (
		<div style={{width, height, background: '#ffffff', fontFamily: '"Times New Roman", serif', color: '#000', overflow: 'hidden'}}>
			<div style={{background: '#1F3F99', color: '#FFFF00', padding: compact ? 10 : 16, fontSize: compact ? 26 : 40, fontWeight: 700, textAlign: 'center', borderBottom: '4px ridge #999'}}>
				{script.client.name.toUpperCase()}
			</div>
			<div style={{background: '#C0C0C0', padding: 6, fontSize: compact ? 14 : 18, textAlign: 'center'}}>
				{['Accueil', 'Nos biens', 'Contact', 'Livre d’or'].map((l) => (
					<span key={l} style={{color: '#0000EE', textDecoration: 'underline', margin: '0 10px'}}>
						{l}
					</span>
				))}
			</div>
			<div style={{padding: compact ? 14 : 30, fontSize: compact ? 18 : 24}}>
				<div style={{color: 'red', fontWeight: 700, fontSize: compact ? 22 : 32, textAlign: 'center'}}>!!! Bienvenue sur notre site !!!</div>
				<p>Nous vendons et louons des maisons à Douala. Contactez-nous pour plus d’informations.</p>
				<div style={{display: 'flex', gap: 12}}>
					{[1, 2, 3].slice(0, compact ? 2 : 3).map((i) => (
						<div key={i} style={{flex: 1, height: compact ? 120 : 200, background: '#DDD', border: '2px solid #888', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 16}}>
							photo{i}.jpg
						</div>
					))}
				</div>
				<p style={{fontSize: compact ? 14 : 18}}>Tel : 6XX XX XX XX — Email : agence@yahoo.fr</p>
				<div style={{fontSize: 14, color: '#666', textAlign: 'center', marginTop: 20}}>© 2009 — Site optimisé pour Internet Explorer 6 — Visiteurs : 000127</div>
			</div>
		</div>
	);
};

const MotionBefore: React.FC<Props> = ({script, width, height}) => {
	const base = Math.min(width, height);
	return (
		<div
			style={{
				width,
				height,
				background: '#FFF200',
				fontFamily: '"Comic Sans MS", "Comic Neue", cursive',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: base * 0.04,
				color: '#E00000',
				textAlign: 'center',
			}}
		>
			<div style={{fontSize: base * 0.14, fontWeight: 700, textShadow: '4px 4px 0 #00A000'}}>{script.client.name.toUpperCase()}</div>
			<div style={{width: base * 0.3, height: base * 0.3, borderRadius: '50%', background: '#FF8C00', border: '6px solid #000'}} />
			<div style={{fontSize: base * 0.06, color: '#000'}}>JUS NATUREL BON ET PAS CHER</div>
			<div style={{fontSize: base * 0.05, color: '#0000CC'}}>Appelez nous !!! 6XX XX XX XX</div>
		</div>
	);
};

const CodingBefore: React.FC<Props> = ({script, width, height}) => {
	const compact = width < 800;
	const cols = ['N°', 'Quartier', 'Montant', 'Statut', 'Date'].slice(0, compact ? 4 : 5);
	return (
		<div style={{width, height, background: '#fff', fontFamily: 'Arial, sans-serif', fontSize: compact ? 14 : 18, color: '#000', overflow: 'hidden'}}>
			<div style={{background: '#217346', color: '#fff', padding: '8px 14px', fontSize: compact ? 15 : 20}}>commandes_{script.client.name.toLowerCase().replace(/\s+/g, '_')}_FINAL_v3.xlsx</div>
			<div style={{background: '#F3F3F3', padding: '6px 14px', borderBottom: '1px solid #ccc', color: '#444'}}>Fichier · Accueil · Insertion · Formules</div>
			<table style={{borderCollapse: 'collapse', width: '100%'}}>
				<thead>
					<tr>
						{cols.map((c) => (
							<th key={c} style={{border: '1px solid #ccc', background: '#E8E8E8', padding: 6, textAlign: 'left'}}>
								{c}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{new Array(compact ? 14 : 16).fill(0).map((_, r) => (
						<tr key={r}>
							{cols.map((c, ci) => (
								<td key={c} style={{border: '1px solid #ddd', padding: 6, color: ci === 2 && r % 5 === 3 ? 'red' : '#000'}}>
									{ci === 0 ? 4800 + r : ci === 1 ? script.client.details[r % 5] : ci === 2 ? (r % 5 === 3 ? '#REF!' : `${(r * 1750) % 20000 + 2500}`) : ci === 3 ? (r % 3 ? 'ok' : '??') : '12/03'}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export const BeforeVisual: React.FC<Props> = (props) => {
	if (props.script.kind === 'web') return <WebBefore {...props} />;
	if (props.script.kind === 'motion') return <MotionBefore {...props} />;
	return <CodingBefore {...props} />;
};

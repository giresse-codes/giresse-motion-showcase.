import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {config, invoiceTotal, money} from '../config';
import {theme} from '../theme';
import {T} from '../timeline';
import {AppWindow, ease, fadeUp, Pill, progress, soft} from '../ui/kit';
import {Phone, IPHONE13_RATIO} from '../ui/Phone';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Entrée (ressort doux) et sortie (recul vers la gauche) d'une fenêtre */
const windowMotion = (frame: number, from: number, exitAt: number | null): React.CSSProperties => {
	const enter = soft(frame, from, 26);
	const exit = exitAt === null ? 0 : progress(frame, exitAt, 16);
	return {
		opacity: Math.min(1, enter * 1.4) * (1 - exit),
		transform: `translate3d(${-exit * 260}px, ${(1 - enter) * 70}px, ${(1 - enter) * -160 - exit * 240}px)`,
	};
};

const visible = (frame: number, from: number, to: number) => frame >= from - 2 && frame <= to + 20;

/** Texte qui s'écrit caractère par caractère */
const typed = (text: string, frame: number, start: number, duration = 14) => text.slice(0, Math.round(text.length * progress(frame, start, duration)));

// -----------------------------------------------------------------------------
// Repères des pastilles : position dans la messagerie, puis champ cible dans la commande (repère de la scène)

const PILL_H = 56;
const pillWidth = (text: string) => text.length * 14.5 + 46;
const PILL_START = (() => {
	const [a, b, c, d] = config.inbox.pills;
	const x0 = 392;
	return [
		{x: x0, y: 560},
		{x: x0 + pillWidth(a) + 14, y: 560},
		{x: x0, y: 560 + PILL_H + 14},
		{x: x0 + pillWidth(c) + 14, y: 560 + PILL_H + 14},
	].map((p, i) => ({...p, w: pillWidth([a, b, c, d][i])}));
})();

// Champs du formulaire « Nouvelle commande » (repère de la scène)
const FORM = {x: 296, full: 638, half: 309, gap: 20};
const FIELD_ROWS = [326, 450, 574, 698];
const FIELD_H = 64;
const PILL_TARGETS = [
	{x: FORM.x, y: FIELD_ROWS[2]},
	{x: FORM.x + FORM.half + FORM.gap, y: FIELD_ROWS[2]},
	{x: FORM.x, y: FIELD_ROWS[3]},
	{x: FORM.x + FORM.half + FORM.gap, y: FIELD_ROWS[3]},
];

// -----------------------------------------------------------------------------
// 1 → 5 s : MESSAGERIE

const Avatar: React.FC<{initials: string; size: number; active?: boolean}> = ({initials, size, active}) => (
	<div style={{width: size, height: size, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color: theme.text, background: active ? `linear-gradient(135deg, ${theme.accent}, #6E93FF)` : 'rgba(140,170,255,0.18)'}}>
		{initials}
	</div>
);

const initialsOf = (name: string) =>
	name
		.split(' ')
		.map((w) => w[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

export const InboxScene: React.FC = () => {
	const frame = useCurrentFrame();
	const t = T.inbox;
	if (!visible(frame, t.from, t.to)) return null;
	const parts = config.inbox.message.split(/(\[[^\]]+\])/);
	let key = -1;
	return (
		<AppWindow title={config.inbox.title} x={30} y={120} width={940} height={760} style={windowMotion(frame, t.windowIn, t.to)}>
			<div style={{display: 'flex', height: '100%'}}>
				{/* Liste des conversations */}
				<div style={{width: 330, borderRight: `1px solid ${theme.divider}`, padding: 18}}>
					<div style={{padding: '12px 16px', borderRadius: 12, background: 'rgba(8,14,36,0.5)', color: theme.muted, fontSize: 20, marginBottom: 14}}>Rechercher…</div>
					{[{name: config.client.name, preview: config.client.company, time: config.inbox.time}, ...config.inbox.others].map((c, i) => (
						<div key={c.name} style={{display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 6, background: i === 0 ? 'rgba(47,107,255,0.25)' : 'transparent'}}>
							<Avatar initials={initialsOf(c.name.replace('Mme ', ''))} size={46} active={i === 0} />
							<div style={{flex: 1, minWidth: 0}}>
								<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 19, fontWeight: 600}}>
									<span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{c.name}</span>
								</div>
								<div style={{fontSize: 16, color: theme.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{c.preview}</div>
							</div>
							{i === 0 && <div style={{width: 10, height: 10, borderRadius: '50%', background: theme.accent}} />}
						</div>
					))}
				</div>
				{/* Conversation */}
				<div style={{flex: 1, padding: '22px 28px'}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 18, borderBottom: `1px solid ${theme.divider}`}}>
						<Avatar initials={config.client.initials} size={56} active />
						<div style={{flex: 1}}>
							<div style={{fontSize: 24, fontWeight: 700}}>{config.client.name}</div>
							<div style={{fontSize: 18, color: theme.soft}}>{config.client.company}</div>
						</div>
						<div style={{fontSize: 18, color: theme.muted}}>{config.inbox.time}</div>
					</div>
					<div style={{marginTop: 26, padding: '20px 24px', borderRadius: '6px 22px 22px 22px', background: 'rgba(140,170,255,0.12)', border: `1px solid ${theme.divider}`, fontSize: 28, lineHeight: 1.5, ...fadeUp(frame, t.messageAt, 16, 16)}}>
						{parts.map((p, i) => {
							if (!p.startsWith('[')) return <React.Fragment key={i}>{p}</React.Fragment>;
							key += 1;
							const glow = progress(frame, t.pills[key], 10);
							return (
								<span key={i} style={{borderRadius: 8, padding: '0 4px', background: `rgba(47,107,255,${0.45 * glow})`, boxShadow: glow > 0 ? `0 0 ${18 * glow}px rgba(47,107,255,${0.6 * glow})` : undefined}}>
									{p.slice(1, -1)}
								</span>
							);
						})}
					</div>
					<div style={{marginTop: 30, fontSize: 18, letterSpacing: 2, textTransform: 'uppercase', color: theme.muted, ...fadeUp(frame, t.pills[0] - 6, 12, 8)}}>{config.inbox.detectedLabel}</div>
				</div>
			</div>
		</AppWindow>
	);
};

/** Pastilles : s'allument dans la messagerie, puis s'envolent vers les champs de la commande */
export const PillsLayer: React.FC = () => {
	const frame = useCurrentFrame();
	const t = T.inbox;
	const o = T.order;
	if (frame < t.pills[0] - 2 || frame > o.from + o.fieldsAt[3] + 12) return null;
	return (
		<>
			{config.inbox.pills.map((text, i) => {
				const appear = progress(frame, t.pills[i], 10);
				const arrive = o.from + o.fieldsAt[i];
				const fly = progress(frame, arrive - 16, 16);
				const s = PILL_START[i];
				const target = PILL_TARGETS[i];
				// Le centre de la pastille rejoint le centre du champ
				const tx = target.x + FORM.half / 2 - (s.x + s.w / 2);
				const ty = target.y + FIELD_H / 2 - (s.y + PILL_H / 2);
				const lift = Math.sin(Math.PI * fly) * -60;
				const fade = 1 - progress(frame, arrive, 8);
				return (
					<div
						key={text}
						style={{
							position: 'absolute',
							left: s.x,
							top: s.y,
							opacity: appear * fade,
							transform: `translate3d(${tx * fly}px, ${ty * fly + lift}px, 60px) scale(${(0.85 + 0.15 * appear) * (1 - 0.15 * fly)})`,
						}}
					>
						<Pill text={text} glow={appear * (1 - fly * 0.5)} />
					</div>
				);
			})}
		</>
	);
};

// -----------------------------------------------------------------------------
// 5 → 9 s : SAISIE AUTOMATIQUE

const Field: React.FC<{label: string; value: string; filled: number; width: number; style?: React.CSSProperties}> = ({label, value, filled, width, style}) => (
	<div style={{position: 'absolute', width, ...style}}>
		<div style={{fontSize: 19, color: theme.muted, marginBottom: 10, height: 20}}>{label}</div>
		<div
			style={{
				height: FIELD_H,
				borderRadius: 12,
				padding: '0 18px',
				display: 'flex',
				alignItems: 'center',
				fontSize: 25,
				fontWeight: 500,
				background: 'rgba(8,14,36,0.55)',
				border: `1px solid ${filled > 0 ? `rgba(110,147,255,${0.4 + 0.5 * (1 - filled)})` : theme.divider}`,
				boxShadow: filled > 0 && filled < 1 ? `0 0 ${24 * (1 - filled)}px rgba(47,107,255,0.6)` : undefined,
				whiteSpace: 'nowrap',
				overflow: 'hidden',
			}}
		>
			<span style={{opacity: filled}}>{value}</span>
		</div>
	</div>
);

export const OrderScene: React.FC = () => {
	const frame = useCurrentFrame();
	const o = T.order;
	if (!visible(frame, o.from, o.to)) return null;
	const local = frame - o.from;
	const f = config.order.fields;
	const v = config.order.values;
	const fill = (i: number) => progress(local, o.fieldsAt[i], 10);
	const done = progress(local, o.fieldsAt[3] + 12, 12);
	// Champs positionnés dans le repère de la scène, puis ramenés dans celui du contenu de la fenêtre
	const at = (x: number, y: number): React.CSSProperties => ({left: x - 260, top: y - 176 - 30});
	return (
		<AppWindow title={config.appName} x={30} y={120} width={940} height={900} sidebar={2} style={windowMotion(frame, o.from, o.to)}>
			<div style={{position: 'absolute', left: 36, top: 26, right: 36, display: 'flex', alignItems: 'center'}}>
				<div style={{fontSize: 32, fontWeight: 700, whiteSpace: 'nowrap'}}>{config.order.title}</div>
				<div style={{flex: 1}} />
				<div style={{fontSize: 16, fontWeight: 600, color: theme.success, whiteSpace: 'nowrap', padding: '7px 14px', borderRadius: 999, background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.4)', opacity: done}}>✓ {config.order.status}</div>
			</div>
			<Field label={f.client} value={typed(`${config.client.name} · ${config.client.company}`, local, o.clientAt, 16)} filled={progress(local, o.clientAt, 4)} width={FORM.full} style={at(FORM.x, FIELD_ROWS[0])} />
			<Field label={f.article} value={typed(config.order.article, local, o.clientAt + 10, 10)} filled={progress(local, o.clientAt + 10, 4)} width={FORM.full} style={at(FORM.x, FIELD_ROWS[1])} />
			<Field label={f.quantity} value={v[0]} filled={fill(0)} width={FORM.half} style={at(PILL_TARGETS[0].x, PILL_TARGETS[0].y)} />
			<Field label={f.size} value={v[1]} filled={fill(1)} width={FORM.half} style={at(PILL_TARGETS[1].x, PILL_TARGETS[1].y)} />
			<Field label={f.delivery} value={v[2]} filled={fill(2)} width={FORM.half} style={at(PILL_TARGETS[2].x, PILL_TARGETS[2].y)} />
			<Field label={f.address} value={v[3]} filled={fill(3)} width={FORM.half} style={at(PILL_TARGETS[3].x, PILL_TARGETS[3].y)} />
		</AppWindow>
	);
};

// -----------------------------------------------------------------------------
// 9 → 13 s : FACTURE

const InvoiceBody: React.FC<{local: number}> = ({local}) => {
	const inv = config.invoice;
	const i = T.invoice;
	const total = invoiceTotal * progress(local, i.totalStart, i.totalEnd - i.totalStart);
	const send = progress(local, i.sendAt, 10);
	const cols = '1fr 56px 130px 150px';
	return (
		<div style={{position: 'absolute', inset: 0, padding: '28px 36px'}}>
			<div style={{display: 'flex', alignItems: 'flex-start', ...fadeUp(local, 0, 14, 12)}}>
				<div>
					<div style={{fontSize: 34, fontWeight: 700}}>{inv.number}</div>
					<div style={{fontSize: 20, color: theme.muted, marginTop: 6}}>{inv.date}</div>
				</div>
				<div style={{flex: 1}} />
				<div style={{textAlign: 'right', fontSize: 20, color: theme.soft, lineHeight: 1.45}}>
					{config.client.name}
					<br />
					{config.client.company}
				</div>
			</div>
			<div style={{marginTop: 34, display: 'grid', gridTemplateColumns: cols, padding: '0 0 14px', borderBottom: `1px solid ${theme.divider}`, fontSize: 18, letterSpacing: 1, textTransform: 'uppercase', color: theme.muted, ...fadeUp(local, 6, 12, 8)}}>
				{inv.columns.map((c, k) => (
					<div key={c} style={{textAlign: k === 0 ? 'left' : 'right'}}>
						{c}
					</div>
				))}
			</div>
			{inv.lines.map((l, k) => (
				<div key={l.label} style={{display: 'grid', gridTemplateColumns: cols, alignItems: 'center', padding: '22px 0', borderBottom: `1px solid ${theme.divider}`, fontSize: 23, ...fadeUp(local, i.linesAt[k], 14, 14)}}>
					<div style={{paddingRight: 12, lineHeight: 1.3}}>{l.label}</div>
					<div style={{textAlign: 'right', color: theme.soft}}>{l.qty}</div>
					<div style={{textAlign: 'right', color: theme.soft}}>{money(l.price)}</div>
					<div style={{textAlign: 'right', fontWeight: 600}}>{money(l.qty * l.price)}</div>
				</div>
			))}
			<div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 30, marginTop: 34, ...fadeUp(local, i.totalStart - 6, 12, 10)}}>
				<div style={{fontSize: 24, color: theme.soft}}>{inv.totalLabel}</div>
				<div style={{fontSize: 64, fontWeight: 800, letterSpacing: -1, fontVariantNumeric: 'tabular-nums'}}>{money(total)}</div>
			</div>
			<div style={{position: 'absolute', right: 36, bottom: 36, display: 'flex', alignItems: 'center', gap: 12, padding: '18px 36px', borderRadius: 14, fontSize: 26, fontWeight: 700, color: theme.text, background: send > 0 ? `rgba(47,107,255,${0.45 + 0.55 * send})` : 'rgba(140,170,255,0.12)', boxShadow: send > 0 ? `0 0 ${40 * send}px rgba(47,107,255,0.7)` : 'none', border: `1px solid ${theme.border}`}}>
				{inv.send} ➤
			</div>
		</div>
	);
};

export const InvoiceScene: React.FC = () => {
	const frame = useCurrentFrame();
	const i = T.invoice;
	const p = T.phone;
	if (!visible(frame, i.from, p.from + p.flyEnd)) return null;
	const local = frame - i.from;
	// À 13 s, la facture s'envole et rapetisse jusque dans le téléphone
	const fly = progress(frame, p.from, p.flyEnd);
	const enter = soft(frame, i.from, 26);
	return (
		<AppWindow
			title={config.appName}
			x={30}
			y={120}
			width={940}
			height={880}
			sidebar={3}
			style={{
				opacity: Math.min(1, enter * 1.4) * (1 - progress(frame, p.from + p.flyEnd - 10, 10)),
				transform: `translate3d(${fly * 20}px, ${(1 - enter) * 70 + fly * 160}px, ${(1 - enter) * -160 + fly * 80}px) scale(${1 - fly * 0.6})`,
				transformOrigin: '50% 50%',
			}}
		>
			<InvoiceBody local={local} />
		</AppWindow>
	);
};

// -----------------------------------------------------------------------------
// 13 → 17 s : TÉLÉPHONE

const PhoneScreen: React.FC<{local: number}> = ({local}) => {
	const p = T.phone;
	const tap = progress(local, p.tapAt, 8);
	const pressed = local >= p.tapAt && local < p.tapAt + 8;
	const notif = soft(local, p.notifAt, 20);
	const paid = local >= p.notifAt;
	return (
		<div style={{position: 'absolute', inset: 0, fontFamily: theme.font, color: theme.text, background: 'linear-gradient(180deg, #121A36, #0A1026)'}}>
			<div style={{display: 'flex', justifyContent: 'space-between', padding: '18px 34px 0', fontSize: 17, fontWeight: 600}}>
				<span>10:24</span>
				<span>●●● 5G ▮</span>
			</div>
			<div style={{padding: '46px 26px 0'}}>
				<div style={{fontSize: 17, color: theme.muted}}>{config.phone.merchant}</div>
				<div style={{fontSize: 26, fontWeight: 700, marginTop: 6}}>{config.invoice.number}</div>
				<div style={{marginTop: 26, padding: 20, borderRadius: 18, background: 'rgba(140,170,255,0.1)', border: `1px solid ${theme.divider}`}}>
					{config.invoice.lines.map((l) => (
						<div key={l.label} style={{display: 'flex', justifyContent: 'space-between', fontSize: 16, color: theme.soft, marginBottom: 12, gap: 10}}>
							<span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{l.label}</span>
							<span style={{whiteSpace: 'nowrap'}}>{money(l.qty * l.price)}</span>
						</div>
					))}
					<div style={{height: 1, background: theme.divider, margin: '6px 0 14px'}} />
					<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
						<span style={{fontSize: 17, color: theme.soft}}>{config.invoice.totalLabel}</span>
						<span style={{fontSize: 36, fontWeight: 800}}>{money(invoiceTotal)}</span>
					</div>
				</div>
				<div style={{marginTop: 22, fontSize: 16, color: paid ? theme.success : theme.muted, fontWeight: 600}}>{paid ? '✓ Payée' : 'En attente de paiement'}</div>
			</div>
			{/* Bouton Payer + doigt qui appuie */}
			<div style={{position: 'absolute', left: 26, right: 26, bottom: 54}}>
				<div style={{height: 70, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, background: paid ? 'rgba(140,170,255,0.18)' : theme.accent, transform: `scale(${pressed ? 0.96 : 1})`, boxShadow: paid ? 'none' : '0 0 30px rgba(47,107,255,0.6)'}}>
					{config.phone.pay} {money(invoiceTotal)}
				</div>
				{local >= p.tapAt - 2 && local < p.tapAt + 16 && (
					<div style={{position: 'absolute', left: '50%', top: '50%', width: 60 + tap * 60, height: 60 + tap * 60, transform: 'translate(-50%, -50%)', borderRadius: '50%', background: `rgba(255,255,255,${0.35 * (1 - tap)})`, border: `2px solid rgba(255,255,255,${0.8 * (1 - tap)})`}} />
				)}
			</div>
			{/* Notification verte « Paiement reçu » */}
			{local >= p.notifAt - 1 && (
				<div style={{position: 'absolute', left: 14, right: 14, top: 50, transform: `translateY(${(1 - notif) * -140}px)`, opacity: notif, padding: '16px 18px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(20,32,30,0.95)', border: '1px solid rgba(34,197,94,0.55)', boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 30px rgba(34,197,94,0.35)'}}>
					<div style={{width: 44, height: 44, borderRadius: 12, background: theme.success, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#06210F'}}>✓</div>
					<div style={{flex: 1}}>
						<div style={{fontSize: 14, color: 'rgba(255,255,255,0.6)'}}>{config.phone.notificationApp}</div>
						<div style={{fontSize: 20, fontWeight: 700}}>{config.phone.notification}</div>
					</div>
					<div style={{fontSize: 22, fontWeight: 800, color: theme.success}}>+{money(invoiceTotal, 0)}</div>
				</div>
			)}
		</div>
	);
};

export const PhoneScene: React.FC = () => {
	const frame = useCurrentFrame();
	const p = T.phone;
	if (!visible(frame, p.from, p.to)) return null;
	const local = frame - p.from;
	const enter = soft(frame, p.from + 6, 30);
	const exit = progress(frame, p.to, 16);
	const width = 400;
	return (
		<div
			style={{
				position: 'absolute',
				left: 500 - width / 2,
				top: 120,
				opacity: Math.min(1, enter * 1.5) * (1 - exit),
				transform: `translate3d(${-exit * 260}px, ${(1 - enter) * 120}px, ${(1 - enter) * -200 + 60 - exit * 240}px) rotateY(${interpolate(local, [0, 120], [-6, 6], {...clamp, easing: ease})}deg)`,
			}}
		>
			<Phone width={width}>
				<PhoneScreen local={local} />
			</Phone>
			<div style={{position: 'absolute', left: 0, right: 0, top: width * IPHONE13_RATIO + 10, height: 80, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(47,107,255,0.35), transparent 70%)', filter: 'blur(10px)'}} />
		</div>
	);
};

// -----------------------------------------------------------------------------
// 17 → 22 s : PLANNING + chaîne d'automatisation

export const PlanningScene: React.FC = () => {
	const frame = useCurrentFrame();
	const pl = T.planning;
	if (!visible(frame, pl.from, pl.to)) return null;
	const local = frame - pl.from;
	const event = soft(local, pl.eventAt, 20);
	const chain = soft(local, pl.chainAt, 24);
	const hours = ['08:00', '09:00', '10:00', '11:00', '12:00'];
	const busy = [
		[0, 1],
		[2, 0],
		[3, 3],
		[4, 1],
		[1, 3],
	];
	return (
		<>
			<AppWindow title={config.appName} x={30} y={60} width={940} height={620} sidebar={4} style={windowMotion(frame, pl.from, pl.to)}>
				<div style={{position: 'absolute', inset: 0, padding: '22px 26px'}}>
					<div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
						<div style={{fontSize: 30, fontWeight: 700}}>{config.planning.title}</div>
						<div style={{fontSize: 19, color: theme.muted}}>{config.planning.week}</div>
					</div>
					<div style={{marginTop: 18, display: 'grid', gridTemplateColumns: `64px repeat(7, 1fr)`, gap: 6}}>
						<div />
						{config.planning.days.map((d) => (
							<div key={d} style={{textAlign: 'center', fontSize: 18, fontWeight: 600, color: theme.soft, paddingBottom: 6}}>
								{d}
							</div>
						))}
						{hours.map((h, r) => (
							<React.Fragment key={h}>
								<div style={{fontSize: 15, color: theme.muted, paddingTop: 4}}>{h}</div>
								{config.planning.days.map((d, c) => {
									const isBusy = busy.some(([bc, br]) => bc === c && br === r);
									const isEvent = c === 5 && r === 2;
									return (
										<div key={d} style={{height: 62, borderRadius: 8, background: 'rgba(8,14,36,0.45)', border: `1px solid ${theme.divider}`, position: 'relative', overflow: 'visible'}}>
											{isBusy && <div style={{position: 'absolute', inset: 4, borderRadius: 6, background: 'rgba(140,170,255,0.16)'}} />}
											{isEvent && (
												<div style={{position: 'absolute', left: -2, right: -2, top: -2, height: 128, zIndex: 2, borderRadius: 8, padding: '8px 8px', background: theme.accent, boxShadow: `0 0 ${30 * event}px rgba(47,107,255,0.8)`, opacity: event, transform: `scale(${0.85 + 0.15 * event})`, fontSize: 15, fontWeight: 700, lineHeight: 1.25}}>
													{config.planning.event}
													<div style={{fontWeight: 500, color: '#DCE6FF', marginTop: 4}}>{config.planning.eventPlace}</div>
												</div>
											)}
										</div>
									);
								})}
							</React.Fragment>
						))}
					</div>
				</div>
			</AppWindow>
			{/* Chaîne d'étapes */}
			<div
				style={{
					position: 'absolute',
					left: 30,
					top: 720,
					width: 940,
					padding: '26px 34px',
					borderRadius: theme.radius,
					background: theme.glass,
					border: `1px solid ${theme.border}`,
					backdropFilter: 'blur(18px)',
					boxShadow: '0 40px 90px rgba(0,0,0,0.5)',
					fontFamily: theme.font,
					color: theme.text,
					opacity: Math.min(1, chain * 1.4) * (1 - progress(frame, pl.to, 16)),
					transform: `translate3d(${-progress(frame, pl.to, 16) * 260}px, ${(1 - chain) * 70}px, ${(1 - chain) * -160}px)`,
				}}
			>
				<div style={{fontSize: 19, letterSpacing: 2, textTransform: 'uppercase', color: theme.muted, marginBottom: 14}}>{config.planning.chainTitle}</div>
				{config.planning.steps.map((step, k) => {
					const done = progress(local, pl.stepsAt[k], 10);
					const isLast = k === config.planning.steps.length - 1;
					return (
						<div key={step} style={{display: 'flex', alignItems: 'center', gap: 20, position: 'relative', height: 82}}>
							{!isLast && <div style={{position: 'absolute', left: 21, top: 60, width: 3, height: 44, background: done >= 1 ? 'rgba(34,197,94,0.6)' : theme.divider}} />}
							<div style={{width: 46, height: 46, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#06210F', background: done > 0 ? `rgba(34,197,94,${done})` : 'transparent', border: `2px solid ${done > 0 ? theme.success : theme.border}`, boxShadow: done > 0 ? `0 0 ${20 * done}px rgba(34,197,94,0.5)` : undefined, transform: `scale(${1 + 0.15 * Math.sin(Math.PI * done)})`}}>
								{done > 0.4 ? '✓' : ''}
							</div>
							<div style={{fontSize: 28, fontWeight: 600, color: done > 0 ? theme.text : theme.muted}}>{step}</div>
						</div>
					);
				})}
			</div>
		</>
	);
};

// -----------------------------------------------------------------------------
// 22 → 26 s : TABLEAU DE BORD

export const DashboardScene: React.FC = () => {
	const frame = useCurrentFrame();
	const d = T.dashboard;
	if (!visible(frame, d.from, d.to)) return null;
	const local = frame - d.from;
	const dash = config.dashboard;
	const max = Math.max(...dash.chart);
	const panel: React.CSSProperties = {borderRadius: 14, padding: 22, background: 'rgba(8,14,36,0.5)', border: `1px solid ${theme.divider}`};
	return (
		<AppWindow title={config.appName} x={30} y={120} width={940} height={980} sidebar={0} style={windowMotion(frame, d.from, null)}>
			<div style={{position: 'absolute', inset: 0, padding: '26px 30px', display: 'flex', flexDirection: 'column', gap: 18}}>
				<div style={{fontSize: 32, fontWeight: 700}}>{dash.title}</div>
				<div style={{display: 'flex', gap: 14}}>
					{dash.kpis.map((k, i) => (
						<div key={k.label} style={{flex: 1, ...panel, ...fadeUp(local, d.kpisAt + i * 4, 14, 14)}}>
							<div style={{fontSize: 19, color: theme.muted}}>{k.label}</div>
							<div style={{fontSize: 56, fontWeight: 800, marginTop: 4, fontVariantNumeric: 'tabular-nums'}}>{Math.round(k.value * progress(local, d.kpisAt + i * 4, 26))}</div>
						</div>
					))}
				</div>
				<div style={{...panel, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.45)', ...fadeUp(local, d.todayAt, 16, 14)}}>
					<div style={{width: 52, height: 52, borderRadius: 14, background: theme.success, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#06210F'}}>✓</div>
					<div style={{fontSize: 46, fontWeight: 800, color: theme.success, fontVariantNumeric: 'tabular-nums'}}>{money(invoiceTotal * progress(local, d.todayAt, 20), 0)}</div>
					<div style={{fontSize: 26, color: theme.text}}>{dash.todayLabel}</div>
				</div>
				<div style={{...panel, flex: 1, display: 'flex', flexDirection: 'column', ...fadeUp(local, d.barsAt - 10, 14, 14)}}>
					<div style={{fontSize: 21, color: theme.soft, marginBottom: 16}}>{dash.chartTitle}</div>
					<div style={{flex: 1, display: 'flex', alignItems: 'flex-end', gap: 18}}>
						{dash.chart.map((v, i) => {
							const grow = progress(local, d.barsAt + i * 3, 22);
							return (
								<div key={i} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, height: '100%', justifyContent: 'flex-end'}}>
									<div style={{width: '100%', height: `${(v / max) * 82 * grow}%`, borderRadius: '8px 8px 4px 4px', background: i === dash.chart.length - 1 ? theme.accent : 'rgba(110,147,255,0.45)', boxShadow: i === dash.chart.length - 1 ? '0 0 24px rgba(47,107,255,0.6)' : undefined}} />
									<div style={{fontSize: 16, color: theme.muted}}>{config.planning.days[i]}</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</AppWindow>
	);
};

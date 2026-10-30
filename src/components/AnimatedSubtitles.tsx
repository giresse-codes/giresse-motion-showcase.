import React, {useMemo} from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../theme';
import {useLayout} from '../lib/layout';
import {springs} from '../lib/anim';
import type {VoiceSegment} from '../config';

type Word = {text: string; start: number; end: number};
type Chunk = {words: Word[]; start: number; end: number};

/** Répartit la durée de chaque segment sur ses mots (proportionnellement à leur longueur). */
export const segmentsToWords = (segments: VoiceSegment[]): Word[][] =>
	segments.map((seg) => {
		const words = seg.text.split(/\s+/).filter(Boolean);
		const weights = words.map((w) => w.length + 2);
		const total = weights.reduce((a, b) => a + b, 0);
		let t = seg.start;
		return words.map((w, i) => {
			const d = ((seg.end - seg.start) * weights[i]) / total;
			const word = {text: w, start: t, end: t + d};
			t += d;
			return word;
		});
	});

const toChunks = (segments: VoiceSegment[], maxWords: number): Chunk[] => {
	const chunks: Chunk[] = [];
	segmentsToWords(segments).forEach((words) => {
		for (let i = 0; i < words.length; i += maxWords) {
			const part = words.slice(i, i + maxWords);
			chunks.push({words: part, start: part[0].start, end: part[part.length - 1].end});
		}
	});
	return chunks;
};

// Sous-titres animés style TikTok, synchronisés sur la voix off, mot actif en surbrillance.
export const AnimatedSubtitles: React.FC<{segments: VoiceSegment[]}> = ({segments}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {isVertical, u} = useLayout();
	const chunks = useMemo(() => toChunks(segments, isVertical ? 4 : 6), [segments, isVertical]);
	const t = frame / fps;
	const chunk = chunks.find((c) => t >= c.start - 0.05 && t < c.end + 0.15);
	if (!chunk) return null;

	const enter = spring({frame: frame - Math.round(chunk.start * fps), fps, config: springs.snappy});
	const fs = (isVertical ? 64 : 54) * u;

	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				bottom: (isVertical ? 300 : 70) * u,
				display: 'flex',
				justifyContent: 'center',
				flexWrap: 'wrap',
				gap: `${8 * u}px ${16 * u}px`,
				padding: `0 ${60 * u}px`,
				transform: `translateY(${(1 - enter) * 30 * u}px) scale(${0.85 + 0.15 * enter})`,
				opacity: enter,
				zIndex: 50,
			}}
		>
			{chunk.words.map((w, i) => {
				const active = t >= w.start && t < w.end;
				const done = t >= w.end;
				const wp = spring({frame: frame - Math.round(w.start * fps), fps, config: springs.bouncy});
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							padding: `${4 * u}px ${14 * u}px`,
							borderRadius: 14 * u,
							fontFamily: theme.fonts.display,
							fontWeight: 800,
							fontSize: fs,
							textTransform: 'uppercase',
							letterSpacing: -0.01 * fs,
							color: active ? '#0B0B12' : done ? '#ffffff' : 'rgba(255,255,255,0.75)',
							background: active ? theme.colors.highlight : 'transparent',
							boxShadow: active ? `0 0 ${30 * u}px rgba(250,204,21,0.7)` : 'none',
							transform: `scale(${active ? 1 + 0.12 * wp : 1}) rotate(${active ? -2 : 0}deg)`,
							WebkitTextStroke: active ? undefined : `${2 * u}px rgba(0,0,0,0.85)`,
							paintOrder: 'stroke fill',
							textShadow: active ? 'none' : `0 ${4 * u}px ${12 * u}px rgba(0,0,0,0.9)`,
						}}
					>
						{w.text}
					</span>
				);
			})}
		</div>
	);
};

import {theme} from '../theme';

export type Token = {text: string; color: string};

const KEYWORDS = new Set([
	'import', 'from', 'export', 'const', 'let', 'var', 'return', 'function', 'type', 'default',
	'if', 'else', 'new', 'true', 'false', 'null', 'undefined', 'async', 'await', 'for', 'of',
	'in', 'interface', 'class', 'extends',
]);

const RULES: {re: RegExp; color: (m: string, rest: string) => string}[] = [
	{re: /^\/\/.*/, color: () => theme.syntax.comment},
	{re: /^(['"`])(?:\\.|(?!\1).)*\1/, color: () => theme.syntax.string},
	{re: /^<\/?[A-Za-z][\w.]*/, color: () => theme.syntax.tag},
	{re: /^\d[\d_.]*/, color: () => theme.syntax.number},
	{
		re: /^[A-Za-z_$][\w$]*/,
		color: (m, rest) => {
			if (KEYWORDS.has(m)) return theme.syntax.keyword;
			if (/^\s*\(/.test(rest)) return theme.syntax.function;
			if (/^=[^=>]/.test(rest)) return theme.syntax.attr;
			if (/^[A-Z]/.test(m)) return theme.syntax.function;
			return theme.syntax.plain;
		},
	},
	{re: /^\s+/, color: () => theme.syntax.plain},
	{re: /^[{}()[\];,.:=<>/+*%&|!?-]+/, color: () => theme.syntax.punctuation},
	{re: /^./, color: () => theme.syntax.plain},
];

// Coloration syntaxique minimaliste (TS / TSX) pour l'éditeur animé.
export const tokenizeLine = (line: string): Token[] => {
	const tokens: Token[] = [];
	let rest = line;
	while (rest.length > 0) {
		for (const rule of RULES) {
			const m = rest.match(rule.re);
			if (m) {
				const after = rest.slice(m[0].length);
				tokens.push({text: m[0], color: rule.color(m[0], after)});
				rest = after;
				break;
			}
		}
	}
	return tokens;
};

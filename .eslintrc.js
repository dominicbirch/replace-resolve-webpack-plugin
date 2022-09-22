/** @type {import("eslint").ESLint.ConfigData} */
module.exports = {
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
	],
	extends: [
		'xo',
	],
	ignorePatterns: [
		'dist/**',
		'node_modules/**',
	],
};

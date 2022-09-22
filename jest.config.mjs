/** @type {import("ts-jest").InitialOptionsTsJest} */
export default {
	preset: "ts-jest",
	testEnvironment: "node",
	coverageDirectory: "coverage",
	coverageReporters: [
		"cobertura",
		"clover",
		"lcov",
	],
};
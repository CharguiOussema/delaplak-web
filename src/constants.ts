export type ConfigType = {
	API_URL: string;
	CRM_URL: string;
};

const DEV_CONFIG: ConfigType = {
	API_URL: import.meta.env.VITE_API_URL || "http://localhost:3001",
	CRM_URL: "http://localhost:5173",
};

const PRODUCTION_CONFIG: ConfigType = {
	API_URL: import.meta.env.VITE_API_URL || "http://localhost:3001",
	CRM_URL: "http://localhost:5173",
};

const TEST_CONFIG: ConfigType = {
	API_URL: "http://localhost:3001",
	CRM_URL: "http://localhost:5173",
};

const getEnvironment = (): "development" | "production" | "test" => {
	if (import.meta.env.MODE === "test") return "test";
	if (import.meta.env.MODE === "production") return "production";
	return "development";
};

const getConfig = (): ConfigType => {
	const env = getEnvironment();
	switch (env) {
		case "production":
			return PRODUCTION_CONFIG;
		case "test":
			return TEST_CONFIG;
		case "development":
		default:
			return DEV_CONFIG;
	}
};

export const CONFIG = getConfig();
export const API_URL = CONFIG.API_URL;
export const CRM_URL = CONFIG.CRM_URL;

export const isDevelopment = getEnvironment() === "development";
export const isProduction = getEnvironment() === "production";
export const isTest = getEnvironment() === "test";

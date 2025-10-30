"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
exports.normalizeName = normalizeName;
const express_1 = __importDefault(require("express"));
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const VALIDATION_URL = "https://schoolbaseapp.com/validate-name";
const USERS_PATH = node_path_1.default.resolve(__dirname, "../data/users.json");
const app = (0, express_1.default)();
exports.app = app;
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.get("/api/validate-users", (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield loadUsers();
        for (const name of users) {
            yield validateUser(name);
        }
        res.json({ validated: users.length });
    }
    catch (error) {
        next(error);
    }
}));
app.use((error, _req, res, _next) => {
    if (res.headersSent) {
        return;
    }
    const message = error instanceof Error
        ? error.message
        : "Unexpected error while validating user names.";
    res.status(500).json({ error: message });
});
const port = Number((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3001);
if (process.env.NODE_ENV !== "test") {
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}
function loadUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const raw = yield node_fs_1.promises.readFile(USERS_PATH, "utf8");
        return JSON.parse(raw);
    });
}
function normalizeName(originalName) {
    // Normalize Unicode (NFC preserves composed characters) and replace apostrophe-like marks with ASCII '
    const apostropheLike = /[\u2018\u2019\u201B\u02BC\u2032\u2035]/g; // ‘ ’ ‛ ʼ ′ ‵
    const normalized = originalName
        .normalize("NFC")
        .replace(apostropheLike, "'")
        .replace(/\s+/g, " ")
        .trim();
    return normalized;
}
function validateUser(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const sanitizedName = normalizeName(name);
        const url = `${VALIDATION_URL}?name=${encodeURIComponent(sanitizedName)}`;
        let response;
        try {
            response = yield fetch(url);
        }
        catch (_error) {
            console.error(`${sanitizedName} - Failed to reach validation service.`);
            process.exit(1);
        }
        const message = yield extractMessage(response);
        if (response.status !== 200) {
            console.error(`${sanitizedName} - ${message}`);
            process.exit(1);
        }
        console.log(`${sanitizedName} - ${message}`);
    });
}
function extractMessage(response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const payload = (yield response.json());
            if (typeof (payload === null || payload === void 0 ? void 0 : payload.message) === "string") {
                return payload.message;
            }
        }
        catch (_error) {
            // Ignore JSON parse errors, they are handled below.
        }
        return `Received status ${response.status}`;
    });
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('ClassDore API');
});
const port = process.env.PORT || 3000;
mongoose_1.default.connect(process.env.MONGO_URI || '')
    .then(() => {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
})
    .catch((error) => {
    console.error('Database connection failed:', error);
});

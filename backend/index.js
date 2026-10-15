import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "node:dns";
import cookieParser from "cookie-parser";
import cors from "cors";

import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const port = 8082;

mongoose.connect(process.env.dburl).then(() => {
    console.log("database connected");
}).catch((err) => {
    console.log(err);
});

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'], credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

app.get('/', (req, res) => {
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({
            message: "ShopKart Customer Authentication Service is up and running!",
            status: "success",
            endpoints: [
                { method: "POST", path: "/customers/register", auth: false, desc: "Register a new customer" },
                { method: "POST", path: "/customers/login", auth: false, desc: "Authenticate customer and set JWT cookie" },
                { method: "GET", path: "/customers/me", auth: true, desc: "Get logged-in customer profile" },
                { method: "POST", path: "/customers/logout", auth: true, desc: "Log out customer and clear cookie" }
            ]
        });
    }

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShopKart — Customer Authentication API</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0d1117;
            --card-bg: rgba(22, 27, 34, 0.85);
            --card-border: rgba(48, 54, 61, 0.7);
            --text-primary: #f0f6fc;
            --text-secondary: #8b949e;
            --accent: #58a6ff;
            --accent-glow: rgba(88, 166, 255, 0.15);
            --success: #3fb950;
            --danger: #f85149;
            --warning: #d29922;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Outfit', sans-serif;
            background: radial-gradient(circle at 50% 0%, #161b22 0%, #0d1117 100%);
            color: var(--text-primary);
            min-height: 100vh;
            padding: 30px 20px;
        }

        .container {
            max-width: 1100px;
            margin: 0 auto;
        }

        header {
            text-align: center;
            margin-bottom: 35px;
        }

        .badge {
            display: inline-block;
            background: rgba(63, 185, 80, 0.15);
            color: var(--success);
            border: 1px solid rgba(63, 185, 80, 0.4);
            border-radius: 20px;
            padding: 4px 14px;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 12px;
        }

        h1 {
            font-size: 2.3rem;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #ffffff 0%, #8b949e 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        p.subtitle {
            color: var(--text-secondary);
            font-size: 1.05rem;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        @media (max-width: 768px) {
            .grid { grid-template-columns: 1fr; }
        }

        .card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 24px;
            backdrop-filter: blur(10px);
            transition: border-color 0.2s, box-shadow 0.2s;
        }

        .card:hover {
            border-color: rgba(88, 166, 255, 0.4);
            box-shadow: 0 4px 20px var(--accent-glow);
        }

        .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        }

        .card-title {
            font-size: 1.15rem;
            font-weight: 600;
        }

        .method {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 6px;
        }

        .post { background: rgba(88, 166, 255, 0.15); color: #58a6ff; border: 1px solid rgba(88, 166, 255, 0.3); }
        .get { background: rgba(63, 185, 80, 0.15); color: #3fb950; border: 1px solid rgba(63, 185, 80, 0.3); }

        .form-group {
            margin-bottom: 14px;
        }

        label {
            display: block;
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin-bottom: 6px;
        }

        input {
            width: 100%;
            background: #090d13;
            border: 1px solid var(--card-border);
            border-radius: 8px;
            padding: 10px 14px;
            color: var(--text-primary);
            font-family: inherit;
            font-size: 0.95rem;
            outline: none;
            transition: border-color 0.2s;
        }

        input:focus {
            border-color: var(--accent);
        }

        .btn {
            background: var(--accent);
            color: #0d1117;
            border: none;
            border-radius: 8px;
            padding: 10px 18px;
            font-family: inherit;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s, transform 0.1s;
            width: 100%;
            margin-top: 6px;
        }

        .btn:hover { opacity: 0.9; }
        .btn:active { transform: scale(0.98); }
        .btn-danger { background: var(--danger); color: white; }
        .btn-success { background: var(--success); color: #0d1117; }

        .console {
            background: #05080c;
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
        }

        .console-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }

        .console-title {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9rem;
            color: var(--text-secondary);
        }

        pre {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.88rem;
            color: #7ee787;
            background: #000;
            padding: 14px;
            border-radius: 8px;
            overflow-x: auto;
            max-height: 260px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="badge">● Server Online • Port 8082 • MongoDB Connected</div>
            <h1>ShopKart Customer Auth API</h1>
            <p class="subtitle">Interactive Test Console for Engineering Lab 01</p>
        </header>

        <div class="grid">
            <!-- Task 1: Register -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Task 1: Register Customer</span>
                    <span class="method post">POST /customers/register</span>
                </div>
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="regFullName" value="John Doe">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="regEmail" value="john@gmail.com">
                </div>
                <div class="form-group">
                    <label>Password (min 6 chars)</label>
                    <input type="password" id="regPass" value="john123">
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" id="regPhone" value="9876543210">
                </div>
                <button class="btn" onclick="handleRegister()">Register Account</button>
            </div>

            <!-- Task 2: Login -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Task 2: Customer Login</span>
                    <span class="method post">POST /customers/login</span>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="loginEmail" value="john@gmail.com">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="loginPass" value="john123">
                </div>
                <button class="btn btn-success" onclick="handleLogin()">Login (Sets HttpOnly Cookie)</button>

                <hr style="border-color: var(--card-border); margin: 24px 0 16px;">

                <div class="card-header">
                    <span class="card-title">Task 3 & 4: Profile & Logout</span>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn" style="flex: 1;" onclick="handleGetProfile()">Get Profile (GET /me)</button>
                    <button class="btn btn-danger" style="flex: 1;" onclick="handleLogout()">Logout</button>
                </div>
            </div>
        </div>

        <div class="console">
            <div class="console-header">
                <span class="console-title">Live Response Console</span>
                <span id="responseStatus" style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">Status: Ready</span>
            </div>
            <pre id="output">// API responses will appear here</pre>
        </div>
    </div>

    <script>
        const output = document.getElementById('output');
        const statusSpan = document.getElementById('responseStatus');

        function displayResult(status, data) {
            statusSpan.innerText = 'Status: ' + status;
            statusSpan.style.color = status >= 200 && status < 300 ? '#3fb950' : '#f85149';
            output.innerText = JSON.stringify(data, null, 2);
        }

        async function handleRegister() {
            try {
                const res = await fetch('/customers/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName: document.getElementById('regFullName').value,
                        email: document.getElementById('regEmail').value,
                        password: document.getElementById('regPass').value,
                        phone: document.getElementById('regPhone').value
                    })
                });
                const data = await res.json();
                displayResult(res.status, data);
            } catch (err) {
                displayResult(500, { error: err.message });
            }
        }

        async function handleLogin() {
            try {
                const res = await fetch('/customers/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        email: document.getElementById('loginEmail').value,
                        password: document.getElementById('loginPass').value
                    })
                });
                const data = await res.json();
                displayResult(res.status, data);
            } catch (err) {
                displayResult(500, { error: err.message });
            }
        }

        async function handleGetProfile() {
            try {
                const res = await fetch('/customers/me', {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await res.json();
                displayResult(res.status, data);
            } catch (err) {
                displayResult(500, { error: err.message });
            }
        }

        async function handleLogout() {
            try {
                const res = await fetch('/customers/logout', {
                    method: 'POST',
                    credentials: 'include'
                });
                const data = await res.json();
                displayResult(res.status, data);
            } catch (err) {
                displayResult(500, { error: err.message });
            }
        }
    </script>
</body>
</html>`);
});
app.use('/customers', customerRoutes);

app.listen(port, () => {
    console.log(`server started at port ${port}`);
});
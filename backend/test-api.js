// Comprehensive automated test suite for ShopKart Customer Authentication Service
const BASE_URL = "http://localhost:8082";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ✅ PASS: ${message}`);
    } else {
        failedTests++;
        console.error(`  ❌ FAIL: ${message}`);
    }
}

async function runTests() {
    console.log("==================================================");
    console.log("🚀 Starting ShopKart Authentication Test Suite");
    console.log(`📍 Target Server: ${BASE_URL}`);
    console.log("==================================================\n");

    const testId = Date.now();
    const testEmail = `testuser_${testId}@shopkart.com`;
    const testPassword = "securePassword123";
    let authCookie = "";

    // ----------------------------------------------------
    // TASK 1: REGISTRATION TESTS
    // ----------------------------------------------------
    console.log("📦 [Task 1] Testing Customer Registration (POST /customers/register)");

    // 1.1 Success Registration
    try {
        const res = await fetch(`${BASE_URL}/customers/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullName: "Test Customer",
                email: testEmail,
                password: testPassword,
                phone: "9876543210"
            })
        });
        const data = await res.json();
        assert(res.status === 201, `Status 201 Created on valid registration (Got ${res.status})`);
        assert(data.success === true, "Response success is true");
        assert(data.customer && data.customer.email === testEmail, "Customer profile returned in response");
        assert(!data.customer?.password, "Customer password is NOT exposed in response");
    } catch (e) {
        assert(false, `Registration failed with error: ${e.message}`);
    }

    // 1.2 Failure: Missing fields (400)
    try {
        const res = await fetch(`${BASE_URL}/customers/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullName: "Missing Email",
                password: testPassword,
                phone: "9876543210"
            })
        });
        assert(res.status === 400, `Status 400 on missing required field (Got ${res.status})`);
    } catch (e) {
        assert(false, `Missing field test error: ${e.message}`);
    }

    // 1.3 Failure: Password too short (< 6 chars) (400)
    try {
        const res = await fetch(`${BASE_URL}/customers/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullName: "Short Pass",
                email: `short_${testId}@shopkart.com`,
                password: "123",
                phone: "9876543210"
            })
        });
        assert(res.status === 400, `Status 400 on password shorter than 6 chars (Got ${res.status})`);
    } catch (e) {
        assert(false, `Short password test error: ${e.message}`);
    }

    // 1.4 Failure: Email already exists (409)
    try {
        const res = await fetch(`${BASE_URL}/customers/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullName: "Duplicate User",
                email: testEmail,
                password: testPassword,
                phone: "9876543210"
            })
        });
        assert(res.status === 409, `Status 409 Conflict on duplicate email (Got ${res.status})`);
    } catch (e) {
        assert(false, `Duplicate email test error: ${e.message}`);
    }

    console.log();

    // ----------------------------------------------------
    // TASK 2: LOGIN TESTS
    // ----------------------------------------------------
    console.log("🔐 [Task 2] Testing Customer Login (POST /customers/login)");

    // 2.1 Success Login & Cookie extraction
    try {
        const res = await fetch(`${BASE_URL}/customers/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword
            })
        });
        const data = await res.json();
        assert(res.status === 200, `Status 200 OK on valid credentials (Got ${res.status})`);
        assert(data.success === true, "Response success is true");
        assert(data.message === "Login successful", 'Response message is "Login successful"');

        const setCookieHeader = res.headers.get("set-cookie");
        assert(Boolean(setCookieHeader && setCookieHeader.includes("token=")), "HttpOnly token cookie is set");
        assert(Boolean(setCookieHeader && setCookieHeader.toLowerCase().includes("httponly")), "Cookie has HttpOnly flag");

        if (setCookieHeader) {
            authCookie = setCookieHeader.split(";")[0];
        }
    } catch (e) {
        assert(false, `Login test error: ${e.message}`);
    }

    // 2.2 Failure: Wrong password (401)
    try {
        const res = await fetch(`${BASE_URL}/customers/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testEmail,
                password: "wrongPassword"
            })
        });
        assert(res.status === 401, `Status 401 on incorrect password (Got ${res.status})`);
    } catch (e) {
        assert(false, `Wrong password test error: ${e.message}`);
    }

    // 2.3 Failure: Non-existent email (401)
    try {
        const res = await fetch(`${BASE_URL}/customers/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "nonexistent@shopkart.com",
                password: testPassword
            })
        });
        assert(res.status === 401, `Status 401 on non-existent email (Got ${res.status})`);
    } catch (e) {
        assert(false, `Non-existent email test error: ${e.message}`);
    }

    console.log();

    // ----------------------------------------------------
    // TASK 3: GET PROFILE TESTS
    // ----------------------------------------------------
    console.log("👤 [Task 3] Testing Protected Profile (GET /customers/me)");

    // 3.1 Success with valid cookie
    try {
        const res = await fetch(`${BASE_URL}/customers/me`, {
            method: "GET",
            headers: {
                "Cookie": authCookie
            }
        });
        const data = await res.json();
        assert(res.status === 200, `Status 200 OK when authenticated (Got ${res.status})`);
        assert(data.email === testEmail, `Profile email matches logged in customer (${data.email})`);
        assert(data.fullName === "Test Customer", `Profile fullName matches (${data.fullName})`);
        assert(data.phone === "9876543210", `Profile phone matches (${data.phone})`);
        assert(!data.password, "Password is NOT included in profile response");
    } catch (e) {
        assert(false, `Profile test error: ${e.message}`);
    }

    // 3.2 Failure: No token cookie (401)
    try {
        const res = await fetch(`${BASE_URL}/customers/me`, {
            method: "GET"
        });
        assert(res.status === 401, `Status 401 Unauthorized when no cookie is sent (Got ${res.status})`);
    } catch (e) {
        assert(false, `No token test error: ${e.message}`);
    }

    // 3.3 Failure: Invalid token (401)
    try {
        const res = await fetch(`${BASE_URL}/customers/me`, {
            method: "GET",
            headers: {
                "Cookie": "token=invalid.jwt.token"
            }
        });
        assert(res.status === 401, `Status 401 Unauthorized on malformed/invalid token (Got ${res.status})`);
    } catch (e) {
        assert(false, `Invalid token test error: ${e.message}`);
    }

    console.log();

    // ----------------------------------------------------
    // TASK 4: LOGOUT TESTS
    // ----------------------------------------------------
    console.log("🚪 [Task 4] Testing Customer Logout (POST /customers/logout)");

    // 4.1 Success Logout
    try {
        const res = await fetch(`${BASE_URL}/customers/logout`, {
            method: "POST",
            headers: {
                "Cookie": authCookie
            }
        });
        const data = await res.json();
        assert(res.status === 200, `Status 200 OK on logout (Got ${res.status})`);
        assert(data.success === true, "Response success is true");
        assert(data.message === "Logged out successfully", 'Response message is "Logged out successfully"');
    } catch (e) {
        assert(false, `Logout test error: ${e.message}`);
    }

    // 4.2 Failure: Unauthorized logout when no cookie
    try {
        const res = await fetch(`${BASE_URL}/customers/logout`, {
            method: "POST"
        });
        assert(res.status === 401, `Status 401 on logout attempt without cookie (Got ${res.status})`);
    } catch (e) {
        assert(false, `Unauthenticated logout test error: ${e.message}`);
    }

    console.log("\n==================================================");
    console.log(`📊 Test Summary: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
    console.log("==================================================");

    if (failedTests > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error("Fatal Test Runner Error:", err);
    process.exit(1);
});

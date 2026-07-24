import { Problem } from './types';

export const PROBLEMS: Problem[] = [
  {
    id: "voucher-redemption",
    title: "E-commerce Voucher Redemption API",
    role: "Backend Engineer",
    level: "Mid-Level",
    timeLimit: 30,
    category: "REST API Logic & Data Validation",
    description: `## 1. Case Study
A modern e-commerce application provides a promotional voucher redemption system. To protect business margins, **each voucher can only be redeemed once per user**, and vouchers have limited stock quotas.

You are tasked with building a JavaScript REST API endpoint logic for:
\`\`\`http
POST /redeem
\`\`\`

---

## 2. Input Specifications

### Request Body:
\`\`\`json
{
  "userId": 1,
  "voucherCode": "PROMO50"
}
\`\`\`

### Success Response (HTTP 200):
\`\`\`json
{
  "message": "Voucher redeemed successfully"
}
\`\`\`

---

## 3. Initial In-Memory State
Do **NOT** use external databases. Strictly manage data using these in-memory data structures:

\`\`\`javascript
const vouchers = [
  { code: "PROMO50", quota: 5 },
  { code: "WELCOME", quota: 10 }
];

const redeemedVouchers = [];
\`\`\`

---

## 4. Requirements & Validation Rules
1. **Validation 1 (Voucher Existence)**: If the requested \`voucherCode\` does not exist in \`vouchers\`, return \`HTTP 404\` with message *"Voucher tidak ditemukan"* or *"Voucher not found"*.
2. **Validation 2 (User Uniqueness)**: A single user can only claim the same voucher **once**. If the user has already redeemed this voucher code, return \`HTTP 400\` with message *"Anda sudah pernah mengklaim voucher ini"* or *"Voucher already redeemed"*.
3. **Validation 3 (Quota Limit)**: A voucher cannot be redeemed if its \`quota <= 0\`. Return \`HTTP 400\` with message *"Kuota voucher sudah habis"* or *"Voucher quota exhausted"*.
4. **Request Validation**: Check if \`userId\` and \`voucherCode\` are present in the request body. If missing, return \`HTTP 400\`.
5. **State Update**: Upon successful validation:
   - Decrement the voucher's quota by 1 (\`quota -= 1\`).
   - Push \`{ userId, voucherCode }\` into the \`redeemedVouchers\` array.

---

## 5. Conceptual Bonus Question 💡
> **Race Conditions in PostgreSQL Database Migration**
> *In your solution comments, explain how you would prevent race conditions (e.g., overselling quota under high concurrency) if this API were migrated to a PostgreSQL database.*
> 
> *Consider techniques such as:*
> - **Database Transactions & Row-level Locking**: \`SELECT FOR UPDATE\`
> - **Database Unique Constraints**: Unique index on \`(user_id, voucher_code)\`
> - **Atomic Update Queries**: \`UPDATE vouchers SET quota = quota - 1 WHERE code = $1 AND quota > 0;\`
`,
    starterCode: `const express = require('express');
const app = express();
app.use(express.json());

// 1. Initial In-Memory Data State
const vouchers = [
  { code: "PROMO50", quota: 5 },
  { code: "WELCOME", quota: 10 }
];

const redeemedVouchers = [];

// 2. REST API Endpoint Implementation
app.post('/redeem', (req, res) => {
  const { userId, voucherCode } = req.body;

  // TODO: Implement validation & logic here
  // 1. Validate required fields (userId, voucherCode)
  // 2. Check if voucher exists
  // 3. Check if user already redeemed this voucher
  // 4. Check quota availability (> 0)
  // 5. Update quota and record redemption
  
  return res.status(500).json({ message: "Not implemented" });
});

/*
 * BONUS QUESTION RESPONSE:
 * Write your explanation about handling Race Conditions in PostgreSQL below:
 * 
 * 1. Transaction Locking (SELECT FOR UPDATE):
 * 
 * 2. Unique Constraints:
 * 
 * 3. Atomic Updates:
 */

const PORT = 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
  });
}

module.exports = app;
`,
    bonusQuestion: "Explain how to handle Race Conditions if migrated to PostgreSQL (e.g., Database Transaction SELECT FOR UPDATE, Unique Constraints, Atomic Updates).",
    idealSolution: `const express = require('express');
const app = express();
app.use(express.json());

const vouchers = [
  { code: "PROMO50", quota: 5 },
  { code: "WELCOME", quota: 10 }
];

const redeemedVouchers = [];

app.post('/redeem', (req, res) => {
  const { userId, voucherCode } = req.body;

  // 1. Request Body Validation
  if (!userId || !voucherCode) {
    return res.status(400).json({ message: "userId dan voucherCode harus diisi" });
  }

  // 2. Voucher Existence Check
  const voucher = vouchers.find(v => v.code === voucherCode);
  if (!voucher) {
    return res.status(404).json({ message: "Voucher tidak ditemukan" });
  }

  // 3. One User Per Voucher Check
  const hasRedeemed = redeemedVouchers.some(
    r => r.userId === userId && r.voucherCode === voucherCode
  );
  if (hasRedeemed) {
    return res.status(400).json({ message: "Anda sudah pernah mengklaim voucher ini" });
  }

  // 4. Quota Check
  if (voucher.quota <= 0) {
    return res.status(400).json({ message: "Kuota voucher sudah habis" });
  }

  // 5. Update Data State
  voucher.quota -= 1;
  redeemedVouchers.push({ userId, voucherCode });

  return res.status(200).json({ message: "Voucher redeemed successfully" });
});

/*
 * BONUS QUESTION ANSWER:
 * 
 * 1. SELECT FOR UPDATE (Row Locking):
 *    Wrap the check-and-update flow inside a database transaction.
 *    Execute 'SELECT quota FROM vouchers WHERE code = $1 FOR UPDATE'.
 *    This locks the voucher row so concurrent transactions must wait, preventing race conditions.
 *
 * 2. UNIQUE CONSTRAINT:
 *    Add a unique constraint on table 'redeemed_vouchers(user_id, voucher_code)'.
 *    If two concurrent requests attempt to insert the same claim simultaneously, 
 *    PostgreSQL rejects the second insert with a unique constraint violation error.
 *
 * 3. ATOMIC UPDATE QUERY:
 *    Execute 'UPDATE vouchers SET quota = quota - 1 WHERE code = $1 AND quota > 0 RETURNING quota;'.
 *    This relies on PostgreSQL's atomic row mutation, eliminating race conditions without manual row locking.
 */

const PORT = 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

module.exports = app;`,
    testCases: [
      {
        id: "tc_success",
        name: "Successful Redemption (PROMO50)",
        input: { userId: 1, voucherCode: "PROMO50" },
        expectedStatus: 200,
        expectedMessageSubstring: "successfully"
      },
      {
        id: "tc_not_found",
        name: "Non-existent Voucher Code",
        input: { userId: 1, voucherCode: "INVALID99" },
        expectedStatus: 404
      },
      {
        id: "tc_duplicate_redemption",
        name: "Prevent Duplicate Redemption by Same User",
        input: { userId: 1, voucherCode: "PROMO50" },
        expectedStatus: 400,
        setupFn: "already_redeemed"
      },
      {
        id: "tc_missing_params",
        name: "Missing userId or voucherCode",
        input: { userId: 1, voucherCode: "" },
        expectedStatus: 400
      }
    ]
  }
];

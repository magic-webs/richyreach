import { Context } from "hono";
import { getDb } from "../db";
import { users, walletTransactions } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import Razorpay from "razorpay";
import crypto from "crypto";

export class WalletController {
  static async getBalance(c: Context) {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    try {
      const db = getDb(c.env);
      
      const dbUser = await db.select({ walletBalance: users.walletBalance }).from(users).where(eq(users.id, user.id)).get();
      if (!dbUser) return c.json({ error: "User not found" }, 404);

      const transactions = await db.select().from(walletTransactions).where(eq(walletTransactions.userId, user.id)).orderBy(desc(walletTransactions.createdAt));

      return c.json({
        success: true,
        data: {
          balance: dbUser.walletBalance,
          transactions
        }
      });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  }

  static async createOrder(c: Context) {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    try {
      const { amount } = await c.req.json(); // amount in paise
      if (!amount || amount <= 0) return c.json({ error: "Invalid amount" }, 400);

      // Initialize Razorpay
      const key_id = process.env.RAZORPAY_KEY_ID;
      const key_secret = process.env.RAZORPAY_KEY_SECRET;
      
      if (!key_id || !key_secret) {
        // Mock order for dev environment
        return c.json({
          success: true,
          data: {
            id: `order_mock_${Date.now()}`,
            amount: amount,
            currency: "INR",
          }
        });
      }

      const razorpay = new Razorpay({
        key_id,
        key_secret,
      });

      const options = {
        amount,
        currency: "INR",
        receipt: `rcpt_${Date.now()}_${user.id.substring(0, 8)}`,
      };

      const order = await razorpay.orders.create(options);

      return c.json({
        success: true,
        data: {
          ...order,
          key_id
        }
      });
    } catch (err: any) {
      console.error("Razorpay Create Order Error:", err);
      return c.json({ error: err.message || "Failed to create order" }, 500);
    }
  }

  static async verifyPayment(c: Context) {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = await c.req.json();
      
      const key_secret = process.env.RAZORPAY_KEY_SECRET;

      if (key_secret) {
        // Verify signature
        const shasum = crypto.createHmac("sha256", key_secret);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest("hex");

        if (digest !== razorpay_signature) {
          return c.json({ error: "Transaction not legit!" }, 400);
        }
      } else {
        // Mock verification
        if (!razorpay_order_id?.startsWith("order_mock_")) {
           return c.json({ error: "Invalid mock transaction" }, 400);
        }
      }

      const db = getDb(c.env);

      // Fetch current balance
      const dbUser = await db.select({ walletBalance: users.walletBalance }).from(users).where(eq(users.id, user.id)).get();
      if (!dbUser) return c.json({ error: "User not found" }, 404);

      // Add to balance
      const newBalance = dbUser.walletBalance + amount;
      
      await db.update(users).set({ walletBalance: newBalance }).where(eq(users.id, user.id)).run();
      
      // Log transaction
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await db.insert(walletTransactions).values({
        id: transactionId,
        userId: user.id,
        amount,
        type: "credit",
        description: "Razorpay Deposit",
        reference: razorpay_payment_id || "mock_payment",
        status: "completed",
      }).run();

      return c.json({ success: true, data: { balance: newBalance } });
    } catch (err: any) {
      console.error("Razorpay Verify Error:", err);
      return c.json({ error: err.message }, 500);
    }
  }
}

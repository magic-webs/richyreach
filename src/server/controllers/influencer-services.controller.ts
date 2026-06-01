import { Context } from "hono";
import { v2 as cloudinary } from "cloudinary";
import { getDb } from "../db";
import { creatorServices } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { HonoEnv } from "../types";

export class InfluencerServicesController {
  static async listServices(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return c.json({ success: false, error: "Unauthorized" }, 401);

      const db = getDb(c.env as any);
      const services = await db.query.creatorServices.findMany({
        where: eq(creatorServices.influencerId, user.id),
      });

      return c.json({ success: true, data: services });
    } catch (err: any) {
      console.error("[listServices]", err);
      return c.json({ success: false, error: err.message || "Failed to list services" }, 500);
    }
  }

  static async addService(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return c.json({ success: false, error: "Unauthorized" }, 401);

      const db = getDb(c.env as any);
      const body = await c.req.parseBody({ all: true });
      const name = body["name"] as string;
      const type = body["type"] as string;
      const priceStr = body["price"] as string;
      const deliveryTime = body["deliveryTime"] as string;
      const exampleUrlInput = body["exampleUrl"] as string;
      const file = body["video"] as File | undefined;

      let videoUrl = exampleUrlInput || null;

      if (file && file.size > 0) {
        // Init cloudinary with process.env or c.env
        const cloudName = (c.env as any)?.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = (c.env as any)?.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
        const apiSecret = (c.env as any)?.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;

        if (cloudName && apiKey && apiSecret) {
          cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
          });

          const buffer = await file.arrayBuffer();
          const base64Data = Buffer.from(buffer).toString("base64");
          const dataUri = `data:${file.type};base64,${base64Data}`;

          try {
            const uploadResponse = await cloudinary.uploader.upload(dataUri, {
              resource_type: "auto",
              folder: "reelio_services",
            });
            videoUrl = uploadResponse.secure_url;
          } catch (err) {
            console.error("Cloudinary upload error:", err);
            return c.json({ success: false, error: "Video upload failed" }, 500);
          }
        } else {
          console.warn("Cloudinary credentials missing, skipping video upload");
        }
      }

      const price = Math.round(parseFloat(priceStr) * 100); // INR paise
      if (isNaN(price)) return c.json({ success: false, error: "Invalid price" }, 400);

      // We can use a simple random string for ID if uuid is not configured
      const newId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

      const [newService] = await db.insert(creatorServices).values({
        id: newId,
        influencerId: user.id,
        name,
        type,
        price,
        deliveryTime: deliveryTime || null,
        exampleUrl: videoUrl,
      }).returning();

      return c.json({ success: true, data: newService });
    } catch (err: any) {
      console.error("[addService]", err);
      return c.json({ success: false, error: err.message || "Failed to add service" }, 500);
    }
  }

  static async deleteService(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return c.json({ success: false, error: "Unauthorized" }, 401);

      const serviceId = c.req.param("id");
      if (!serviceId) return c.json({ success: false, error: "Missing service ID" }, 400);

      const db = getDb(c.env as any);

      await db.delete(creatorServices).where(
        and(
          eq(creatorServices.id, serviceId),
          eq(creatorServices.influencerId, user.id)
        )
      );

      return c.json({ success: true });
    } catch (err: any) {
      console.error("[deleteService]", err);
      return c.json({ success: false, error: err.message || "Failed to delete service" }, 500);
    }
  }

  static async updateService(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return c.json({ success: false, error: "Unauthorized" }, 401);

      const serviceId = c.req.param("id");
      if (!serviceId) return c.json({ success: false, error: "Missing service ID" }, 400);

      const db = getDb(c.env as any);
      const body = await c.req.parseBody({ all: true });
      
      const name = body["name"] as string;
      const type = body["type"] as string;
      const priceStr = body["price"] as string;
      const deliveryTime = body["deliveryTime"] as string;
      const exampleUrlInput = body["exampleUrl"] as string;
      const file = body["video"] as File | undefined;

      let videoUrl = exampleUrlInput || null;

      if (file && file.size > 0) {
        const cloudName = (c.env as any)?.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = (c.env as any)?.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
        const apiSecret = (c.env as any)?.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;

        if (cloudName && apiKey && apiSecret) {
          cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
          });

          const buffer = await file.arrayBuffer();
          const base64Data = Buffer.from(buffer).toString("base64");
          const dataUri = `data:${file.type};base64,${base64Data}`;

          try {
            const uploadResponse = await cloudinary.uploader.upload(dataUri, {
              resource_type: "auto",
              folder: "reelio_services",
            });
            videoUrl = uploadResponse.secure_url;
          } catch (err) {
            console.error("Cloudinary upload error:", err);
            return c.json({ success: false, error: "Video upload failed" }, 500);
          }
        } else {
          console.warn("Cloudinary credentials missing, skipping video upload");
        }
      } else {
        // If no new file uploaded, keep the old video URL if exampleUrlInput wasn't provided directly
        if (!exampleUrlInput) {
           const existing = await db.query.creatorServices.findFirst({
             where: and(eq(creatorServices.id, serviceId), eq(creatorServices.influencerId, user.id))
           });
           if (existing) {
             videoUrl = existing.exampleUrl;
           }
        }
      }

      const price = Math.round(parseFloat(priceStr) * 100);
      if (isNaN(price)) return c.json({ success: false, error: "Invalid price" }, 400);

      const [updatedService] = await db.update(creatorServices)
        .set({
          name,
          type,
          price,
          deliveryTime: deliveryTime || null,
          exampleUrl: videoUrl,
        })
        .where(
          and(
            eq(creatorServices.id, serviceId),
            eq(creatorServices.influencerId, user.id)
          )
        ).returning();

      return c.json({ success: true, data: updatedService });
    } catch (err: any) {
      console.error("[updateService]", err);
      return c.json({ success: false, error: err.message || "Failed to update service" }, 500);
    }
  }
}

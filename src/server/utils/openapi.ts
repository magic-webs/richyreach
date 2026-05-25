export function getOpenApiSpec(host: string) {
  return {
    openapi: "3.0.3",
    info: {
      title: "Reelio API",
      description: "Production-ready APIs for AI-powered Influencer × Brand collaboration platform.",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://${host}/api`,
        description: "Current environment server",
      },
      {
        url: "http://localhost:3000/api",
        description: "Local development server",
      },
    ],
    paths: {
      "/auth/signup": {
        post: {
          tags: ["Authentication"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SignUpPayload" },
              },
            },
          },
          responses: {
            201: {
              description: "User registered successfully",
              content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
            },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Log in with email/password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginPayload" },
              },
            },
          },
          responses: {
            200: {
              description: "Session created successfully",
              content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
            },
          },
        },
      },
      "/auth/session": {
        get: {
          tags: ["Authentication"],
          summary: "Get current user session",
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: "Session retrieved",
            },
            401: {
              description: "Unauthorized",
            },
          },
        },
      },
      "/calculator/reach": {
        post: {
          tags: ["Calculators"],
          summary: "Calculate expected campaign reach and clicks",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReachPayload" },
              },
            },
          },
          responses: {
            200: {
              description: "Calculations output",
            },
          },
        },
      },
      "/calculator/earnings": {
        post: {
          tags: ["Calculators"],
          summary: "Estimate influencer earnings potential",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EarningsPayload" },
              },
            },
          },
          responses: {
            200: {
              description: "Calculations output",
            },
          },
        },
      },
      "/influencers": {
        get: {
          tags: ["Influencers"],
          summary: "Query influencer marketplace with pagination and filters",
          parameters: [
            { name: "niche", in: "query", schema: { type: "string" } },
            { name: "level", in: "query", schema: { type: "string", enum: ["nano", "micro", "mid", "macro", "mega"] } },
            { name: "minFollowers", in: "query", schema: { type: "integer" } },
            { name: "maxPricing", in: "query", schema: { type: "integer" } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
            { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
          ],
          responses: {
            200: {
              description: "Paginated list of influencers",
            },
          },
        },
      },
      "/influencers/profile": {
        post: {
          tags: ["Influencers"],
          summary: "Onboard and update influencer profile with Instagram handle",
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/InfluencerProfilePayload" },
              },
            },
          },
          responses: {
            200: {
              description: "Profile updated",
            },
          },
        },
      },
      "/campaigns/create": {
        post: {
          tags: ["Campaigns"],
          summary: "Launch a brand collaboration campaign",
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateCampaignPayload" },
              },
            },
          },
          responses: {
            201: {
              description: "Campaign launched",
            },
          },
        },
      },
      "/chat/rooms": {
        get: {
          tags: ["Messaging"],
          summary: "List user chat rooms",
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: "List of rooms",
            },
          },
        },
      },
      "/chat/message/{roomId}": {
        post: {
          tags: ["Messaging"],
          summary: "Send a direct message in a room",
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: "roomId", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { content: { type: "string" } },
                  required: ["content"],
                },
              },
            },
          },
          responses: {
            201: {
              description: "Message sent",
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "Use Better Auth session headers or dev bearer tokens (e.g. Bearer mock-influencer)",
        },
      },
      schemas: {
        StandardResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
        SignUpPayload: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string" },
            role: { type: "string", enum: ["influencer", "brand", "admin"] },
          },
          required: ["name", "email", "password", "role"],
        },
        LoginPayload: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
          required: ["email", "password"],
        },
        ReachPayload: {
          type: "object",
          properties: {
            budget: { type: "number" },
            influencerTier: { type: "string", enum: ["nano", "micro", "mid", "macro", "mega", "any"] },
            engagementRate: { type: "number" },
          },
          required: ["budget"],
        },
        EarningsPayload: {
          type: "object",
          properties: {
            followers: { type: "integer" },
            engagementRate: { type: "number" },
            niche: { type: "string" },
          },
          required: ["followers", "engagementRate", "niche"],
        },
        InfluencerProfilePayload: {
          type: "object",
          properties: {
            instagramHandle: { type: "string" },
            niche: { type: "string" },
            pricing: { type: "integer", description: "Pricing per post in USD cents" },
            skills: { type: "array", items: { type: "string" } },
          },
          required: ["instagramHandle", "niche", "pricing"],
        },
        CreateCampaignPayload: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            budget: { type: "integer", description: "Campaign budget in USD cents" },
            campaignType: { type: "string", example: "reel" },
            targetAudience: { type: "string" },
            requirements: { type: "string" },
            expectedReach: { type: "integer" },
          },
          required: ["title", "description", "budget", "campaignType"],
        },
      },
    },
  };
}

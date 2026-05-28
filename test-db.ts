import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "libsql://reelio-avijit969.aws-ap-south-1.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzk2OTAwODgsImlkIjoiMDE5ZTVkY2ItNWQwMS03MjMwLTk0MzctZWQ0OWIwZjYyOTEwIiwicmlkIjoiYmQ2NzVjMzAtNzQ5YS00MjQ4LTk0N2MtMjg3NTNkNTZmNjRhIn0.JlPjCqxq-8io05epK56bd_xYd-xuSk6PqDOpV0KX-GDuwOSyQiLAo_z6Zh8UhIFPjx6V9EwwGZGz_6VDVgqICw"
});

async function main() {
  try {
    const res = await client.execute({
      sql: `select * from influencer_profiles where instagram_handle = 'revas.overseas'`,
      args: []
    });
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  }
}

main();

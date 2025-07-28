import { config } from "dotenv";

config({
  path: `.env.${process.env.NODE_ENV || "development"}.local`,
});

export const {
  PORT,
  NODE_ENV,
  MONGO_URI,
  JWT_EXPIRES_IN,
  JWT_SECRET,
  ARCJET_KEY,
  ARCJET_ENV,
  QSTASH_TOKEN,
  QSTASH_URL,
  SERVER_URL,
  EMAIL_PASSWORD
} = process.env;

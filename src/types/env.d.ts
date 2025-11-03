// src/types/environment.d.ts

declare namespace NodeJS {
  /**
   * Defines the required and optional environment variables for the Node.js backend.
   */
  interface ProcessEnv {
    // Database Configuration
    DB_HOST?: string;
    DB_USER?: string;
    DB_PASS?: string;
    DB_NAME?: string;

    // Server Configuration
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    CLIENT_URL?: string;

    // JWT Configuration
    JWT_SECRET: string;
    JWT_EXPIRES_IN?: string;

    // M-Pesa Configuration
    MPESA_CONSUMER_KEY: string;
    MPESA_CONSUMER_SECRET: string;
    MPESA_SHORTCODE: string;
    MPESA_PASSKEY: string;
    CALLBACK_URL: string;
  }
}

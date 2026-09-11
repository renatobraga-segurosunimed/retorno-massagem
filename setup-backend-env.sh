#!/bin/bash

# Backend Environment Variables Setup Script
# Generated from Vly for Git Sync
# Run this script to set up your Convex backend environment variables

echo 'Setting up Convex backend environment variables...'

# Check if Convex CLI is installed
if ! command -v npx &> /dev/null; then
    echo 'Error: npx is not installed. Please install Node.js and npm first.'
    exit 1
fi

echo "Setting JWKS..."
bunx convex env set "JWKS" -- "{\"keys\":[{\"kty\":\"RSA\",\"n\":\"oaq3VWxOIC5egqr2CTGYn0aLUo3vrR8Q5F9KX9AbUr8MVwNWAMNURYvPgAZ-YAjNm2lBL-IS9d-dCtaF_YJypTmHmMvTm6VsNh2hPGq0i-UVt1WbJABv5eAb8oKsmEjr86TZ2pz91ZRXWY7WB2Rqv9oaf046BDcSM1wS5Mi0QvY3WQpLZXWCWXe2Urp3KywHr-64-fHxCyeYw-Wea5KvYI3CEjqcm1puLrDh9_lzSkTs4xnA8JFV5J4VnD3OmjZf4A9ZvqYqvwZEJ_V8Pv42LZgvVU7QTy2qbb_5EdvBTq378a82XDS9zy1PYr1MQZDpwUvrDiZ9g3_Fi7zNMH_CDw\",\"e\":\"AQAB\",\"use\":\"sig\"}]}"

echo "Setting JWT_PRIVATE_KEY..."
bunx convex env set "JWT_PRIVATE_KEY" -- "-----BEGIN PRIVATE KEY----- MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQChqrdVbE4gLl6C qvYJMZifRotSje+tHxDkX0pf0BtSvwxXA1YAw1RFi8+ABn5gCM2baUEv4hL1350K 1oX9gnKlOYeYy9ObpWw2HaE8arSL5RW3VZskAG/l4BvygqyYSOvzpNnanP3VlFdZ jtYHZGq/2hp/TjoENxIzXBLkyLRC9jdZCktldYJZd7ZSuncrLAev7rj58fELJ5jD 5Z5rkq9gjcISOpybWm4usOH3+XNKROzjGcDwkVXknhWcPc6aNl/gD1m+piq/BkQn 9Xw+/jYtmC9VTtBPLaptv/kR28FOrfvxrzZcNL3PLU9ivUxBkOnBS+sOJn2Df8WL vM0wf8IPAgMBAAECggEAHEJ7SbNk9LsmSjEYUQMaar0qHYQyIVEM4t7FYXo/THeY 8Jzkq715Pa7y1q5L6P2g80my22vpZJFyIjLduTLUV4125n66vrpr8Am95ZHBfbLN 2P5d4C0zYjuKpxmwke4tUKnAazaGKI+FtWICh8hF4MN/XkGOYq49wDyYEOYEnK+l 6BmLThkj7hwgtPsDmftgZmSjNUCr8X3OleNycKm6Muy8PcLtl+9XekC3lEc/MJvV Tg4bkR3TPdMzyvYcEEUuHVcfBvqD7lzJbMkTHZIwTH6TNuf9vJ9c4b5pNGDaDM3H ZZ8WWzTecwyldOr2tMZaPZzfDAlTtdNns4PWmN0oAQKBgQDj5Fbw+3eJzzzhWvjx tON2mG+ieyOYJla5MLCjUkjYY/gmDEibvaE13k1a4s33BwSKDyBEuY7x7sv0adx4 DcF6Z/0JH7MyEhKdFsy5DkxpTuVefKiQCQnBIhgxMzgcuX1DjYY+wXm7aFzeiDfa t5QZyxl2DPEHKUbfPCcX0gBKnwKBgQC1m1PQO2mLr2myQu9z1LKGU3NullEuTEkB dXxNmV/DwRPXI/9WE2xckaLFinhHh0ux+zpXw1A8ulMqiK8gD0oHBYqHuY0vieWI 0dGGQnP+PXjmiKrLnLrwa/B5gXQf/LPYIvFH0kGWPzyWAMTTgucGOC70zkAxuSte SlJDvpfCkQKBgQChLvJzNVkCBqrHtYFX65nqWryyjifJyGwURaTZjyxoqKRtvMhq JwBrylSqELqemr8SKsqm8RtycHSe5XUDEK+ktQIaPuqOYov5wZOA2+UdoqjGYKMU ZOAaUtQLkG+CmYtIiUPHBS7lZ1YwKuZecvN0HtteTJ75cq9m2vPHfEeqfwKBgQC0 GAAKzRBC7MZVeBl79Z7ApLshHMIOtqnjX33QelvEhZFGVbVdx887EVWorkPPMzV2 n9vgspi8UE4vLPL2SRMxWWZiaDjBvu84OlKc4QOkSZO+kiNF3fxodbI43I6rNe+n VCeQAMr302ginUqTMgomWcr/DBYO+UEvtWZVNgnLcQKBgElzyjgai/ncOKPfhJkn S3uHhZNMcr5rmB2Ll880D1aUEFj0VZuuUM7ZqFtjyouxhhD8Myn3hedsIZ/56UXR X63xIh40uUHOejZbuvUi9uWrYimuqqMCGSyWLi5K0mDI632C/t/eBRBVr1x5tRJX BcS+Z878gkpkFOU69lJVkpc8 -----END PRIVATE KEY-----"

echo "Setting SITE_URL..."
bunx convex env set "SITE_URL" -- "https://upbeat-mallard-463.convex.site"

echo "Setting VLY_APP_NAME..."
bunx convex env set "VLY_APP_NAME" -- "Retorno Massagem"

echo "Setting VLY_CONVEX_AUTH_ISSUER..."
bunx convex env set "VLY_CONVEX_AUTH_ISSUER" -- "https://freebuff.com"

echo "Setting VLY_INTEGRATION_BASE_URL..."
bunx convex env set "VLY_INTEGRATION_BASE_URL" -- "https://integrations.vly.ai/"

echo "Setting VLY_INTEGRATION_KEY..."
bunx convex env set "VLY_INTEGRATION_KEY" -- "sk_245632846f88a10bd46ed2d965b923923b217768b809e0743f7c152da200555f"

echo "✅ All backend environment variables have been set!"
echo "You can now run: pnpm dev:backend"

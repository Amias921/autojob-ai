# Base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1
# RUN npm run build
# For dev mode we don't strictly need to build, but good to have the stage ready.

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV development
# Using development for now to enable hot reload via volume mounts
# In prod, we would use 'production' and 'npm start'

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
ENV PORT 3000
CMD ["npm", "run", "dev"]

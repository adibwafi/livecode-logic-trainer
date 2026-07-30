# ─── LiveCode Logic Trainer — Production Dockerfile ───────────────────────────
# Multi-stage build: builder → runner
# Optimized for Next.js standalone output (set in next.config.ts)
# Final image: node:20-alpine (~150MB total)
# ──────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Dependencies ─────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# ── Stage 2: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy lockfile + all deps (including devDeps for build tools)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build-time env — override with real key via docker build --build-arg
ARG GROQ_API_KEY=placeholder
ENV GROQ_API_KEY=$GROQ_API_KEY

# Build Next.js standalone output
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# ── Stage 3: Runner ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Fix ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost:3000 || exit 1

CMD ["node", "server.js"]

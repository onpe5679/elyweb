FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/types/package.json ./packages/types/
RUN pnpm install --frozen-lockfile --prod=false --shamefully-hoist
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_WEB_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_WEB_API_URL=$VITE_WEB_API_URL
RUN pnpm install --frozen-lockfile --prod=false --shamefully-hoist
RUN pnpm --filter admin build

FROM nginx:alpine
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

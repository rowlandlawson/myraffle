# Use the official Bun image
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies into temp directory
# This will cache them and speed up future builds
FROM base AS install
mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy node_modules from temp directory
# Then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
# Run Prisma Generate
RUN bunx prisma generate
# Build the application
RUN bun run build

# Copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
# Create dist directory
RUN mkdir -p dist
COPY --from=prerelease /app/dist/server.js dist/server.js
COPY --from=prerelease /app/package.json .
COPY --from=prerelease /app/prisma prisma

# Run the app
USER bun
EXPOSE 10000/tcp
ENTRYPOINT [ "bun", "run", "start" ]

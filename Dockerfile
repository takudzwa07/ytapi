# Use Node.js + Alpine; add FFmpeg via apk
FROM node:18-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy and install deps
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy app code
COPY . .

# Expose port and define start command
ENV PORT=3000
EXPOSE ${PORT}
CMD ["npm", "start"]

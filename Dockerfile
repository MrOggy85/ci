FROM node:10.14.1-alpine AS builder

WORKDIR /home/node/app

COPY . .

RUN node --max_old_space_size=512 `which npm` ci && \
    node --max_old_space_size=512 `which npm` run build

# ---- Second Stage -----
# ------------------------------------
FROM node:10.14.1-alpine
ENV NODE_ENV=production
WORKDIR /home/node/app

COPY ./package* ./

RUN node --max_old_space_size=512 `which npm` ci && \
    node --max_old_space_size=512 `which npm` cache clean --force

# Copy builded source from the upper builder stage
COPY --from=builder /home/node/app/dist ./dist

EXPOSE 5050

CMD [ "node", "./dist/app" ]

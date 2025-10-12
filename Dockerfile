# --- Dockerfile for PocketBase ---
FROM alpine:3.19
WORKDIR /pb

# версии можно обновить на актуальные на github.com/pocketbase/pocketbase/releases
ARG PB_VERSION=0.21.3
RUN apk add --no-cache wget unzip ca-certificates tzdata \
 && wget -q https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
 && unzip pocketbase_${PB_VERSION}_linux_amd64.zip -d /pb \
 && rm pocketbase_${PB_VERSION}_linux_amd64.zip

EXPOSE 8090
# Railway uses $PORT variable, fallback to 8090 for local
ENV PORT=8090
CMD ["/pb/pocketbase","serve","--http","0.0.0.0:${PORT}","--dir","/pb/pb_data"]
# -------------------


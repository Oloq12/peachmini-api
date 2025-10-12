# --- Dockerfile ---
FROM alpine:3.19
WORKDIR /pb

# версии можно обновить на актуальные на github.com/pocketbase/pocketbase/releases
ARG PB_VERSION=0.21.3
RUN apk add --no-cache wget unzip ca-certificates tzdata \
 && wget -q https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
 && unzip pocketbase_${PB_VERSION}_linux_amd64.zip -d /pb \
 && rm pocketbase_${PB_VERSION}_linux_amd64.zip
# ./
#  |- pocketbase
#  |- pb_migrations (можно будет добавить позже)
#  |- pb_data (будет примонтирован диском)

EXPOSE 8090
CMD ["/pb/pocketbase","serve","--http","0.0.0.0:8090","--dir","/pb/pb_data","--public","/pb/pb_public"]
# -------------------


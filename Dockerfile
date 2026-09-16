# ===============================================
FROM registry.access.redhat.com/ubi9/nodejs-22 AS appbase
# ===============================================

WORKDIR /app

USER root
# default:root: install/build steps below run as default and need write access to /app
RUN chown -R default:root /app && npm install --ignore-scripts --global yarn@1.22.22
USER default

# 444: lockfiles are read-only, only consumed by yarn install below; owner is irrelevant here,
# let docker default to root:root
COPY --chmod=444 package.json yarn.lock /app/
# Install dependencies
RUN yarn install --frozen-lockfile --non-interactive --ignore-scripts
# default must own the full source tree: yarn build (in staticbuilder) writes into it
COPY --chown=default:root . /app/

# =============================
FROM appbase AS development
# =============================
CMD ["yarn", "start"]

#==============================
FROM appbase AS staticbuilder
#==============================
ARG REACT_APP_MAP_URL_TEMPLATE
RUN yarn build

# =============================================================
FROM registry.access.redhat.com/ubi8/nginx-124 AS production
# =============================================================
# Copy static build
# root-owned, 555 (read+execute only): default (the nginx runtime user) must never write served assets
COPY --from=staticbuilder --chown=root:root --chmod=555 /app/build /usr/share/nginx/html

# Copy nginx config
# root-owned, 444 (read-only): default (the nginx runtime user) must never modify its own config
COPY --chown=root:root --chmod=444 ./nginx/nginx.conf /etc/nginx/nginx.conf

USER default

EXPOSE 8000
CMD ["nginx", "-g", "daemon off;"]

# ===============================================
FROM helsinkitest/node:14-slim as appbase
# ===============================================

# Offical image has npm log verbosity as info. More info - https://github.com/nodejs/docker-node#verbosity
ENV NPM_CONFIG_LOGLEVEL warn

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Yarn
ENV YARN_VERSION 1.22.10
RUN yarn policies set-version $YARN_VERSION

USER root
RUN apt-install.sh build-essential

# Use non-root user
USER appuser

# Copy all files
COPY --chown=appuser:appuser . .

# Install dependencies
RUN yarn install && yarn cache clean --force

USER root
RUN apt-cleanup.sh build-essential

# =============================
FROM appbase as development
# =============================
USER appuser
CMD ["yarn", "start"]

# =============================
FROM appbase as staticbuilder
# =============================
USER appuser
RUN yarn build

# =============================
FROM registry.access.redhat.com/ubi8/nginx-118 as production
# =============================
USER root
RUN chgrp -R 0 /usr/share/nginx/html && \
    chmod -R g=u /usr/share/nginx/html

# Copy static build
COPY --from=staticbuilder /app/build /usr/share/nginx/html

# Copy nginx config
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Env-script and .env file
WORKDIR /usr/share/nginx/html
COPY ./scripts/env.sh .
COPY .env .

# Make script executable
RUN chmod +x env.sh

USER 1001

CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]

EXPOSE 8000

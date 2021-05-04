# ===============================================
FROM helsinkitest/node:14-slim as appbase
# ===============================================

# Yarn
ENV YARN_VERSION 1.22.10
RUN yarn policies set-version $YARN_VERSION

# Use non-root user
USER appuser

# Copy package.json and package-lock.json/yarn.lock files
COPY package*.json *yarn* ./

# Install npm dependencies
ENV PATH /app/node_modules/.bin:$PATH

USER root
RUN apt-install.sh build-essential

# Install the actual app dependencies
USER appuser
RUN npm config set unsafe-perm true
RUN yarn install && yarn cache clean --force

USER root
RUN apt-cleanup.sh build-essential

# =============================
FROM appbase as development
# =============================

# copy in our source code last, as it changes the most
COPY --chown=appuser:appuser . .

CMD ["react-scripts", "start"]

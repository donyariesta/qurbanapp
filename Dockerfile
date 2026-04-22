FROM php:8.3-fpm

ARG UID=1000
ARG GID=1000

RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    libpq-dev \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-install \
        pdo_pgsql \
        mbstring \
        intl \
        zip \
        bcmath \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN groupmod -o -g ${GID} www-data \
    && usermod -o -u ${UID} -g ${GID} www-data

WORKDIR /var/www

COPY docker/php/entrypoint.sh /usr/local/bin/app-entrypoint
COPY docker/php/php.ini /usr/local/etc/php/conf.d/local.ini

RUN chmod +x /usr/local/bin/app-entrypoint

USER www-data

ENTRYPOINT ["app-entrypoint"]
CMD ["php-fpm"]

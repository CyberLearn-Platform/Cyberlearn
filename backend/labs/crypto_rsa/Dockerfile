FROM php:8.2-apache

# Install GMP extension for RSA operations
RUN apt-get update && apt-get install -y libgmp-dev && docker-php-ext-install gmp

COPY index.php /var/www/html/index.php
RUN echo "FLAG{rsa_crypto_expert_2024}" > /var/www/html/flag.txt

EXPOSE 80

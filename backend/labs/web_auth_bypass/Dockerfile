FROM php:8.2-apache

COPY index.php /var/www/html/index.php
COPY admin.php /var/www/html/admin.php
RUN echo "FLAG{auth_bypass_cookie_master}" > /var/www/html/flag.txt

EXPOSE 80

FROM nginx:alpine

# Serviamo i file statici su :8080 (non :80) per comodità
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf

# Copiamo SOLO ciò che serve alla UI:
# - src/web (pagine)
# - src/engine (caricato da web tramite ../engine/psmEngine.js)
COPY src/web /usr/share/nginx/html/web
COPY src/engine /usr/share/nginx/html/engine

EXPOSE 8080

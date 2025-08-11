FROM nginx:alpine

# set working directory
WORKDIR /usr/share/nginx/html

# copy html files
COPY *.html /usr/share/nginx/html/

# copy directories
COPY styles/ /usr/share/nginx/html/styles/
COPY scripts/ /usr/share/nginx/html/scripts/
COPY public/ /usr/share/nginx/html/public/
COPY src/ /usr/share/nginx/html/src/

#copy Tailwind and configuration files
COPY tailwind.config.js /usr/share/nginx/html/
COPY tailwind.config.ts /usr/share/nginx/html/
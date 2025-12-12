<!-- تست اجرا از داخل خود wsl -->
curl http://localhost:9090  <!-- پرومتهوس -->  
curl http://localhost:3000  <!-- گرافان -->

<!-- پاک کردن -->
docker-compose down

<!-- برسی متریک های برنامه -->
http://localhost:8000/metrics


//////////////////////////
docker rm -f nextjs-prj prometheus grafana

# اجرای پرومتهوس
docker run -d --name prometheus -p 9090:9090 -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus
# اجرای گرافانا
docker run -d --name grafana -p 3001:3000 -e GF_SECURITY_ADMIN_PASSWORD=admin grafana/grafana
# اجرای nextjs
docker run -p 3000:3000 --name nextjs-prj newnextjs-app

docker run --network host -p 3000:3000 --name nextjs-prj newnextjs-app

docker network create monitoring
docker run -d --name prometheus --network monitoring -p 9090:9090 -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus
docker run -d --name grafana --network monitoring -p 3001:3000 -e GF_SECURITY_ADMIN_PASSWORD=admin grafana/grafana

docker run --network host -p 3000:3000 --name nodejs-prj nodejs-app


sudo apt-get update
sudo apt-get install docker-buildx-plugin
sudo docker-compose up -d

///

docker network create mynetwork

docker run --name postgres \
  --network mynetwork \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=postgres \
  -v postgres-data:/var/lib/postgresql \
  -p 5432:5432 \
  -d postgres

docker run --name nextjs \
  --network mynetwork \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=postgres \
  -e POSTGRES_HOST=postgres \
  -p 3000:3000 \
  -d newnextjs-app


///////////////////////////////

docker ps -a
docker logs express-container
docker logs -f express-container
docker stats express-container
docker exec -it express-container sh
docker images
docker rmi docker rmi node
docker update --memory=1g --memory-swap=1g express-container
docker update --cpus=1 express-container
docker restart express-container 


///////////////////////////////

# 1. ساخت image
docker build -t nextjs-images .

# 2. اجرای کانتینر (node server.js به طور خودکار اجرا می‌شود)
docker run --memory=2g --cpus=2 -p 8000:3000 --name express-container --restart unless-stopped docker-app

////////////////////////////////////


هدف	پرس و جو (Query)
درخواست‌های کل	http_request_duration_ms_count
نرخ درخواست	rate(http_request_duration_ms_count[5m])
میانگین زمان پاسخ	rate(http_request_duration_ms_sum[5m]) / rate(http_request_duration_ms_count[5m])
مصرف حافظه	process_resident_memory_bytes
استفاده از CPU	rate(process_cpu_user_seconds_total[5m]) * 100
تأخیر Event Loop	nodejs_eventloop_lag_seconds



up{job="nextjs-app"}
up{job="nextjs-app"}

ip addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}'

sudo -u postgres psql
ALTER USER postgres WITH PASSWORD '123456';
\q
sudo service postgresql restart


sudo netstat -tlnp | grep 5432


 docker exec -it nextjs-app sh
 nc -zv 172.30.4.191 5432


 New-NetFirewallRule -DisplayName "Postgres for Docker on WSL" -Direction Inbound -LocalPort 5432 -Protocol TCP -Action Allow

#	این روش، درخواست‌های localhost:5432 در ویندوز را به WSL هدایت می‌کند
 netsh interface portproxy add v4tov4 


sudo ufw default allow outgoing
sudo ufw default deny incoming

sudo ufw allow ssh
 sudo ufw show added 

 docker network inspect bridge
 sudo ufw allow from 172.17.0.2/16 to any port 5432 comment 'Allow Docker containers to PostgreSQL'

 docker run --network host -p 3000:3000 --name nextjs-prj nextjs-app



 //////////////////////

 sudo apt update
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker

# دانلود ایمیج PostgreSQL
docker pull postgres

# اجرای کانتینر PostgreSQL:
docker run --name postgres -e POSTGRES_PASSWORD=123456 -p 5432:5432 -d postgres

//
docker volume create postgres-data

docker run --name postgres \
  -e POSTGRES_PASSWORD=123456 \
  -p 5432:5432 \
  -v ~/postgres-data:/var/lib/postgresql/data \
  -d postgres

docker run --name postgres -e POSTGRES_PASSWORD=123456 -p 5432:5432 -v postgres-data:/var/lib/postgresql/data -d postgres

# or main  file //

docker volume create postgres-data

docker run --name postgres \
  -e POSTGRES_PASSWORD=123456 \
  -p 5432:5432 \
  -v postgres-data:/var/lib/postgresql \
  -d postgres

docker run --name postgres -e POSTGRES_PASSWORD=123456 -p 5432:5432 -v postgres-data:/var/lib/postgresql -d postgres

////////////////

  docker volume rm pgdata
 # مشاهده Volumeهای موجود
docker volume ls

# بررسی اطلاعات Volume
docker volume inspect postgres-data

    sudo systemctl stop postgresql
    sudo systemctl status postgresql

docker exec -it postgres psql -U postgres -d postgres 

# ایجاد backup قبل از حذف
docker exec postgres pg_dumpall -U postgres > backup.sql

# سپس توقف و حذف
docker stop postgres
docker rm postgres

# کپی backup به داخل کانتینر
docker cp backup.sql postgres:/backup.sql

# اجرای restore
docker exec -it postgres psql -U postgres -f /backup.sql

//////////////

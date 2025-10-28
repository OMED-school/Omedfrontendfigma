# 🚇 Cloudflare Tunnel Deployment Guide

**Deploy School Ideas App Without Port Forwarding Using Cloudflare Tunnel**

---

## Why Cloudflare Tunnel?

### Problems with Traditional Port Forwarding:

- ❌ Security risk (exposing ports to internet)
- ❌ CGNAT issues (many ISPs don't give you public IP)
- ❌ Dynamic IP changes
- ❌ Complex firewall rules
- ❌ No DDoS protection
- ❌ Manual SSL certificate management

### Cloudflare Tunnel Benefits:

- ✅ **No ports open** - Outbound connection only
- ✅ **Works behind CGNAT** - No public IP needed
- ✅ **Free tier** - Up to 50 users for free
- ✅ **Auto SSL** - Free certificates
- ✅ **DDoS protection** - Cloudflare's network
- ✅ **Analytics** - Built-in traffic stats
- ✅ **Easy setup** - 10 minutes
- ✅ **Multiple services** - One tunnel, many apps

---

## How Cloudflare Tunnel Works

```
Your App on Raspberry Pi
         ↓
  cloudflared daemon
         ↓
  (Outbound HTTPS connection - no open ports!)
         ↓
  Cloudflare Edge Network
         ↓
  Your Domain (schoolideas.yourdomain.com)
         ↓
  Users from anywhere
```

**Key Point:** Your Pi makes an **outbound** connection to Cloudflare. No inbound ports are opened!

---

## Prerequisites

1. **Cloudflare Account** (free)
   - Sign up at https://cloudflare.com
2. **Domain Name**
   - Buy from Namecheap, Google Domains, etc. (~$10/year)
   - Or use Cloudflare's free subdomain (yourdomain.cloudflare.com)

3. **Raspberry Pi** with Docker installed

---

## Part 1: Cloudflare Dashboard Setup (10 minutes)

### Step 1: Add Your Domain to Cloudflare

1. **Log into Cloudflare** → https://dash.cloudflare.com

2. **Add a Site**
   - Click "Add a Site"
   - Enter your domain: `yourdomain.com`
   - Choose Free plan
   - Click "Continue"

3. **Update Nameservers**
   - Cloudflare shows you 2 nameservers like:
     ```
     blake.ns.cloudflare.com
     sara.ns.cloudflare.com
     ```
   - Go to your domain registrar (Namecheap/Google Domains)
   - Replace existing nameservers with Cloudflare's
   - Save changes
   - **Wait 5-60 minutes** for DNS propagation

4. **Verify Domain**
   - Back in Cloudflare, click "Check Nameservers"
   - Once verified, you'll see "Great news! Cloudflare is now protecting your site"

### Step 2: Create Cloudflare Tunnel

1. **Zero Trust Dashboard**
   - In Cloudflare dashboard, click "Zero Trust" in left sidebar
   - If first time: Set up a team name (e.g., "SchoolIdeas")

2. **Create Tunnel**
   - Go to **Access** → **Tunnels**
   - Click "Create a tunnel"
   - Choose "Cloudflared"
   - Name it: `schoolideas-tunnel`
   - Click "Save tunnel"

3. **Copy Tunnel Token**
   - You'll see a token like:
     ```
     eyJhIjoiYzQ2MzVkNjU4MGExNGY3NGE0MjA5ZTQ5ZjE3OGIyOTIiLCJ0IjoiODc2NTQzMjEtMWFiYy0xMjM0LTU2NzgtOTBhYmNkZWYxMjM0IiwicyI6Ik5qUmxObVF5TkRBdFpqa3hNQzAwWW1FMkxXSTBZVGN0TkRWbE1UQXpZVEppTWpVMiJ9
     ```
   - **COPY THIS!** You'll need it for Docker setup
   - Click "Next"

4. **Configure Public Hostname**
   - **Subdomain:** `schoolideas`
   - **Domain:** `yourdomain.com`
   - Full URL will be: `schoolideas.yourdomain.com`
   - **Service:**
     - Type: `HTTP`
     - URL: `nginx:80` (internal Docker network)
   - **Additional settings:**
     - ✅ No TLS Verify (since it's local Docker)
   - Click "Save tunnel"

5. **Tunnel is Created!**
   - Status will show "Inactive" until you start cloudflared on your Pi

---

## Part 2: Raspberry Pi Docker Setup (20 minutes)

### Complete Docker Compose Configuration

**File structure on Pi:**

```
~/schoolideas/
├── docker-compose.yml
├── .env
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── ... (your backend code)
├── frontend/
│   └── build/  (your React build)
├── nginx/
│   └── nginx.conf
└── database/
    └── init.sql
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  # ======================================
  # CLOUDFLARE TUNNEL
  # ======================================
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: schoolideas-tunnel
    restart: unless-stopped
    command: tunnel run
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - schoolideas-network
    depends_on:
      - nginx

  # ======================================
  # NGINX REVERSE PROXY
  # ======================================
  nginx:
    image: nginx:alpine
    container_name: schoolideas-nginx
    restart: unless-stopped
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./frontend/build:/usr/share/nginx/html:ro
    networks:
      - schoolideas-network
    depends_on:
      - backend

  # ======================================
  # BACKEND API
  # ======================================
  backend:
    build: ./backend
    container_name: schoolideas-api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: database
      DB_PORT: 5432
      DB_NAME: schoolideas
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    networks:
      - schoolideas-network
    depends_on:
      database:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ======================================
  # POSTGRESQL DATABASE
  # ======================================
  database:
    image: postgres:15-alpine
    container_name: schoolideas-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: schoolideas
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - schoolideas-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ======================================
  # BACKUP SERVICE (runs daily)
  # ======================================
  backup:
    image: postgres:15-alpine
    container_name: schoolideas-backup
    restart: "no"
    environment:
      PGPASSWORD: ${DB_PASSWORD}
    volumes:
      - ./backups:/backups
    networks:
      - schoolideas-network
    entrypoint: >
      /bin/sh -c "
      while true; do
        echo 'Creating backup...'
        pg_dump -h database -U ${DB_USER} schoolideas > /backups/backup_$$(date +%Y%m%d_%H%M%S).sql
        echo 'Backup created'
        find /backups -name '*.sql' -mtime +30 -delete
        sleep 86400
      done
      "
    depends_on:
      - database

networks:
  schoolideas-network:
    driver: bridge

volumes:
  db-data:
```

### .env File

```bash
# Cloudflare Tunnel
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoiYzQ2MzVkNjU4MGExNGY3NGE0MjA5ZTQ5ZjE3OGIyOTIiLCJ0IjoiODc2NTQzMjEtMWFiYy0xMjM0LTU2NzgtOTBhYmNkZWYxMjM0IiwicyI6Ik5qUmxObVF5TkRBdFpqa3hNQzAwWW1FMkxXSTBZVGN0TkRWbE1UQXpZVEppTWpVMiJ9

# Database
DB_USER=schooladmin
DB_PASSWORD=your_super_secure_password_here

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_key_here

# Domain
DOMAIN=schoolideas.yourdomain.com
```

**Generate secure secrets:**

```bash
# On Raspberry Pi
openssl rand -base64 32
```

### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;

    # Upstream backend
    upstream backend {
        server backend:3000;
    }

    server {
        listen 80;
        server_name _;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Max upload size
        client_max_body_size 10M;

        # API endpoints
        location /api/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;

            # Headers
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # WebSocket for chat
        location /ws/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;

            # WebSocket headers
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

            # Timeouts for long-lived connections
            proxy_connect_timeout 7d;
            proxy_send_timeout 7d;
            proxy_read_timeout 7d;
        }

        # Frontend static files
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;

            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

---

## Part 3: Deployment (15 minutes)

### Step 1: Prepare Raspberry Pi

```bash
# SSH into your Raspberry Pi
ssh pi@192.168.1.100

# Create project directory
mkdir -p ~/schoolideas
cd ~/schoolideas

# Create subdirectories
mkdir -p backend frontend/build nginx database backups
```

### Step 2: Upload Your Code

**From your development computer:**

```bash
# Build React frontend
cd school-ideas-app
npm run build

# Compress build
tar -czf frontend.tar.gz build/

# Compress backend
tar -czf backend.tar.gz backend/

# Copy to Pi
scp frontend.tar.gz pi@192.168.1.100:~/schoolideas/
scp backend.tar.gz pi@192.168.1.100:~/schoolideas/
```

**On Raspberry Pi:**

```bash
cd ~/schoolideas

# Extract frontend
tar -xzf frontend.tar.gz -C frontend/
# Result: frontend/build/

# Extract backend
tar -xzf backend.tar.gz

# Clean up
rm frontend.tar.gz backend.tar.gz
```

### Step 3: Create Configuration Files

```bash
# Create docker-compose.yml
nano docker-compose.yml
# Paste the docker-compose.yml content from above

# Create .env
nano .env
# Add your environment variables

# Create nginx config
nano nginx/nginx.conf
# Paste nginx.conf content

# Create database init script
nano database/init.sql
# Paste your database schema
```

### Step 4: Start Everything

```bash
cd ~/schoolideas

# Build and start all containers
docker-compose up -d

# Check status
docker-compose ps

# Watch logs
docker-compose logs -f
```

**You should see:**

```
schoolideas-tunnel    running
schoolideas-nginx     running
schoolideas-api       running
schoolideas-db        running
```

### Step 5: Verify Tunnel Connection

1. **Check Cloudflare Dashboard**
   - Go to Zero Trust → Access → Tunnels
   - Your tunnel should show "Healthy" status
   - Green checkmark

2. **Test Your Domain**

   ```bash
   curl https://schoolideas.yourdomain.com
   # Should return your frontend HTML
   ```

3. **Test API**

   ```bash
   curl https://schoolideas.yourdomain.com/api/health
   # Should return: {"status":"healthy"}
   ```

4. **Test from Browser**
   - Visit `https://schoolideas.yourdomain.com`
   - App should load!

---

## Part 4: Advanced Tunnel Configuration

### Multiple Subdomains on Same Tunnel

You can run multiple services through one tunnel:

```yaml
# In Cloudflare Dashboard → Tunnel → Public Hostname

# Main app
schoolideas.yourdomain.com → http://nginx:80

# Admin panel
admin.yourdomain.com → http://nginx:81

# API directly
api.yourdomain.com → http://backend:3000

# Database admin (pgAdmin)
db.yourdomain.com → http://pgadmin:80
```

### Access Control

**Restrict access to teacher/principal dashboards:**

1. **In Cloudflare Dashboard:**
   - Go to Access → Applications
   - Click "Add an application"
   - Choose "Self-hosted"
2. **Application Setup:**
   - Name: "Teacher Dashboard"
   - Subdomain: `schoolideas`
   - Path: `/teacher/*`
3. **Create Access Policy:**
   - Name: "Teachers Only"
   - Action: Allow
   - Include: Email → `*@school.com`
4. **Save**

Now only users with @school.com emails can access `/teacher/*` routes!

### Analytics & Monitoring

**Enable Analytics in Cloudflare:**

1. Dashboard → Analytics → Overview
2. See traffic stats:
   - Requests per minute
   - Bandwidth usage
   - Top paths
   - Geography
   - Threat analytics

**Application Insights:**

```
Zero Trust → Analytics → Access

See:
- Login attempts
- Active sessions
- Blocked requests
```

---

## Part 5: Maintenance

### Updating Your App

```bash
# On development computer: Build new version
npm run build

# Copy to Pi
scp -r build/* pi@192.168.1.100:~/schoolideas/frontend/build/

# On Pi: Restart nginx (or not needed - static files update automatically)
docker-compose restart nginx
```

### Backend Updates

```bash
# Update backend code
scp -r backend/* pi@192.168.1.100:~/schoolideas/backend/

# Rebuild and restart backend
docker-compose up -d --build backend
```

### Database Backups

**Manual Backup:**

```bash
docker exec schoolideas-db pg_dump -U schooladmin schoolideas > backup.sql
```

**Restore Backup:**

```bash
cat backup.sql | docker exec -i schoolideas-db psql -U schooladmin schoolideas
```

**Download Backup to Your Computer:**

```bash
scp pi@192.168.1.100:~/schoolideas/backups/backup_20250123.sql ./
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f cloudflared

# Last 100 lines
docker-compose logs --tail=100
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend

# Stop all
docker-compose down

# Start all
docker-compose up -d
```

---

## Part 6: Troubleshooting

### Tunnel Shows "Inactive"

**Check:**

```bash
# Check cloudflared container
docker-compose logs cloudflared

# Look for:
# ✅ "Connection registered"
# ❌ "Invalid token"
# ❌ "Failed to connect"
```

**Fix:**

- Verify `CLOUDFLARE_TUNNEL_TOKEN` in `.env`
- Ensure token has no extra spaces
- Recreate tunnel in Cloudflare dashboard if needed

### "502 Bad Gateway" Error

**Means:** Cloudflare can reach tunnel, but nginx/backend is down

**Check:**

```bash
# Is nginx running?
docker ps | grep nginx

# Is backend running?
docker ps | grep api

# Check nginx logs
docker-compose logs nginx

# Check backend logs
docker-compose logs backend
```

**Fix:**

```bash
docker-compose restart nginx
docker-compose restart backend
```

### Database Connection Failed

**Check:**

```bash
# Is database running?
docker ps | grep postgres

# Check database logs
docker-compose logs database

# Test connection
docker exec schoolideas-db psql -U schooladmin -d schoolideas -c "SELECT 1;"
```

**Fix:**

```bash
# Restart database
docker-compose restart database

# If data corrupted, reset (WARNING: deletes data)
docker-compose down -v
docker-compose up -d
```

### SSL/HTTPS Issues

**Cloudflare Tunnel handles SSL automatically!**

If you see mixed content warnings:

- Make sure frontend makes API calls to `https://` not `http://`
- Update `.env.production` in React app:
  ```
  VITE_API_URL=https://schoolideas.yourdomain.com/api
  ```

### Slow Performance

**Check:**

```bash
# Raspberry Pi resources
htop

# Docker stats
docker stats

# Nginx access log
docker-compose logs nginx | grep -i "slow"
```

**Optimize:**

```bash
# Enable Cloudflare caching
# In Cloudflare Dashboard → Caching → Configuration
# Set cache level to "Standard"

# Add page rules for static assets:
# *schoolideas.yourdomain.com/*.js
# Cache Level: Cache Everything
# Edge Cache TTL: 1 month
```

---

## Part 7: Security Best Practices

### 1. Strong Passwords

```bash
# Generate secure password
openssl rand -base64 32

# Use in .env file
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
```

### 2. Limit Database Access

```yaml
# In docker-compose.yml, database service:
database:
  # ... other config
  networks:
    - schoolideas-network
  # DO NOT expose ports to host!
  # ❌ ports:
  #     - "5432:5432"
```

### 3. Environment Variables

```bash
# Never commit .env to git!
echo ".env" >> .gitignore

# Use different secrets for dev/production
```

### 4. Regular Updates

```bash
# Update Docker images monthly
docker-compose pull
docker-compose up -d

# Update Raspberry Pi OS
sudo apt update && sudo apt upgrade -y
```

### 5. Cloudflare WAF Rules

In Cloudflare Dashboard:

1. Security → WAF → Create firewall rule

**Block common attacks:**

```
Name: Block SQL Injection
Expression: (http.request.uri.query contains "union select") or
            (http.request.uri.query contains "drop table")
Action: Block
```

**Rate Limiting:**

```
Name: Rate Limit API
Expression: (http.request.uri.path matches "^/api/")
Requests: 100 per minute per IP
Action: Block
```

### 6. Monitor Access Logs

```bash
# Check for suspicious activity
docker-compose logs nginx | grep -i "404\|401\|403"

# Set up alerts (optional)
# Use Cloudflare Notifications for DDoS, certificate expiry, etc.
```

---

## Part 8: Cost Breakdown

| Item                              | Cost   | Frequency      |
| --------------------------------- | ------ | -------------- |
| Cloudflare Tunnel                 | Free   | -              |
| Cloudflare Zero Trust (free tier) | Free   | Up to 50 users |
| Domain name                       | $10-15 | Annual         |
| Raspberry Pi 4 (4GB)              | $55    | One-time       |
| MicroSD card (64GB)               | $12    | One-time       |
| Power supply                      | $8     | One-time       |
| Case with cooling                 | $10    | One-time       |
| Electricity (~5W 24/7)            | $5     | Annual         |

**Total First Year:** $100-105  
**Annual After:** $15-20

**vs. Traditional Cloud Hosting:**

- Heroku: $25/month = $300/year
- DigitalOcean: $12/month = $144/year
- AWS: $20+/month = $240+/year

**Savings:** $124-285/year!

---

## Part 9: Scaling Considerations

### When to Upgrade

**Stay on Raspberry Pi if:**

- < 500 concurrent users
- < 10 requests/second
- < 1GB database

**Consider cloud upgrade if:**

- > 500 concurrent users
- > 100 requests/second
- Need 99.99% uptime SLA
- Multiple schools/districts

### Raspberry Pi Limits

**Raspberry Pi 4 (4GB) can handle:**

- ✅ 200-500 concurrent users
- ✅ 50 requests/second
- ✅ 10GB database
- ✅ 1000s of messages/day

**Optimize before upgrading:**

1. Add Redis cache
2. Optimize database queries (add indexes)
3. Enable Cloudflare caching
4. Use database connection pooling

### Adding Redis Cache

```yaml
# Add to docker-compose.yml
redis:
  image: redis:alpine
  container_name: schoolideas-redis
  restart: unless-stopped
  networks:
    - schoolideas-network
  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

```javascript
// In backend
const redis = require('redis');
const client = redis.createClient({ host: 'redis' });

// Cache ideas list
app.get('/api/ideas', async (req, res) => {
  const cached = await client.get('ideas:all');
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const ideas = await db.query('SELECT * FROM ideas');
  await client.setEx('ideas:all', 300, JSON.stringify(ideas.rows)); // Cache 5 min
  res.json(ideas.rows);
});
```

---

## Summary

✅ **No port forwarding needed**  
✅ **Free SSL/TLS certificates**  
✅ **DDoS protection included**  
✅ **Works behind CGNAT**  
✅ **Simple Docker setup**  
✅ **Auto backups**  
✅ **Low cost ($15/year after initial setup)**

Your School Ideas app is now:

- 🌐 Accessible from anywhere
- 🔒 Secure (HTTPS + Cloudflare protection)
- 🚀 Fast (Cloudflare CDN)
- 💰 Cheap (Raspberry Pi + free tunnel)
- 🛡️ Protected (WAF + DDoS protection)

---

## Quick Reference Commands

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart <service-name>

# Update containers
docker-compose pull && docker-compose up -d

# Backup database
docker exec schoolideas-db pg_dump -U schooladmin schoolideas > backup.sql

# Check Cloudflare tunnel status
docker-compose logs cloudflared | grep -i "connection\|registered"

# Monitor resources
docker stats

# Clean up
docker system prune -a
```

---

## Need Help?

**ChatGPT Prompt:**

```
I'm deploying School Ideas app on Raspberry Pi using Cloudflare Tunnel. I need help with:

[Describe your specific issue]

My setup:
- Raspberry Pi 4 (4GB RAM)
- Docker Compose running
- Cloudflare Tunnel configured
- Current error: [paste error message]

Please provide step-by-step troubleshooting.
```

Good luck with your deployment! 🎓🚇
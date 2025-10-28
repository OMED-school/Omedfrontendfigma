# Self-Hosting on Raspberry Pi with Docker - Complete Guide

Deploy your School Ideas app on your own Raspberry Pi server with Docker, PostgreSQL, and automated SSL certificates.

---

## Why Self-Host on Raspberry Pi?

✅ **Complete control** - Own your data  
✅ **Low cost** - ~$50-100 one-time  
✅ **Learning** - Great DevOps experience  
✅ **Always on** - Low power consumption (~5W)  
✅ **Private** - No cloud provider access  

---

## What You'll Need

### Hardware:
- **Raspberry Pi 4** (4GB RAM minimum, 8GB recommended)
- **MicroSD card** (32GB minimum, 64GB+ recommended, Class 10/A1)
- **Power supply** (official USB-C adapter recommended)
- **Ethernet cable** (WiFi works but wired is more reliable)
- **Case with cooling** (optional but recommended)

### Other Requirements:
- Internet connection with **public IP** or **dynamic DNS**
- Router with **port forwarding** capability
- Domain name (optional, ~$10/year - e.g., from Namecheap, Google Domains)
- Computer to set up Pi (Windows/Mac/Linux)

### Cost Estimate:
- Raspberry Pi 4 (4GB): ~$55
- MicroSD card: ~$12
- Power supply: ~$8
- Case: ~$10
- Domain (optional): ~$10/year
- **Total:** ~$85 + $10/year

---

## Architecture Overview

```
Internet
    ↓
Your Router (port 80, 443)
    ↓
Raspberry Pi (192.168.1.x)
    ↓
Docker Compose Stack:
    ├── Nginx (reverse proxy + SSL)
    ├── React Frontend (static files)
    ├── Node.js API (backend)
    ├── PostgreSQL (database)
    └── Certbot (auto SSL certificates)
```

---

## Part 1: Set Up Raspberry Pi (45 minutes)

### Step 1: Install Raspberry Pi OS

1. **Download Raspberry Pi Imager:**
   - Visit: https://www.raspberrypi.com/software/
   - Install for your OS (Windows/Mac/Linux)

2. **Flash OS to SD Card:**
   - Insert SD card into computer
   - Open Raspberry Pi Imager
   - **Choose OS:** Raspberry Pi OS (64-bit) - recommended
   - **Choose Storage:** Select your SD card
   - **Settings (gear icon):**
     ```
     Set hostname: schoolideas
     Enable SSH: ✅
     Username: pi
     Password: [your secure password]
     Configure WiFi: [optional]
     Locale: [your timezone]
     ```
   - Click **Write**

3. **Boot Raspberry Pi:**
   - Insert SD card into Pi
   - Connect Ethernet cable
   - Connect power
   - Wait 2-3 minutes for first boot

4. **Find Pi's IP Address:**
   
   **Option A - Router Admin:**
   - Log into router (usually http://192.168.1.1)
   - Look for device named "schoolideas"
   
   **Option B - Network Scan:**
   ```bash
   # On Mac/Linux
   arp -a | grep -i raspberry
   
   # On Windows
   arp -a | findstr "b8-27"
   
   # Or use nmap
   nmap -sn 192.168.1.0/24
   ```

### Step 2: Initial Pi Configuration

1. **SSH into Pi:**
   ```bash
   ssh pi@192.168.1.xxx
   # Replace xxx with your Pi's IP
   # Password: what you set in imager
   ```

2. **Update System:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   # This takes 10-15 minutes
   ```

3. **Install Docker:**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Add user to docker group
   sudo usermod -aG docker pi
   
   # Verify
   docker --version
   ```

4. **Install Docker Compose:**
   ```bash
   # Install docker-compose
   sudo apt install -y docker-compose
   
   # Verify
   docker-compose --version
   ```

5. **Set Static IP (Recommended):**
   ```bash
   # Edit dhcpcd.conf
   sudo nano /etc/dhcpcd.conf
   
   # Add at the end (adjust for your network):
   interface eth0
   static ip_address=192.168.1.100/24
   static routers=192.168.1.1
   static domain_name_servers=192.168.1.1 8.8.8.8
   
   # Save: Ctrl+O, Enter, Ctrl+X
   # Reboot
   sudo reboot
   ```

6. **Reconnect with new IP:**
   ```bash
   ssh pi@192.168.1.100
   ```

---

## Part 2: Configure Router (15 minutes)

### Step 1: Set Up Port Forwarding

1. **Log into router** (usually http://192.168.1.1)
   - Common passwords: admin, password, (check router label)

2. **Find Port Forwarding** section:
   - Also called: Virtual Server, NAT, Applications

3. **Add rules:**
   ```
   HTTP:
   - External Port: 80
   - Internal Port: 80
   - Internal IP: 192.168.1.100 (your Pi)
   - Protocol: TCP
   
   HTTPS:
   - External Port: 443
   - Internal Port: 443
   - Internal IP: 192.168.1.100
   - Protocol: TCP
   ```

4. **Save and apply**

### Step 2: Get Your Public IP

```bash
curl ifconfig.me
# Returns your public IP, e.g., 98.123.45.67
```

**Note:** Most home IPs are dynamic (change occasionally)

### Step 3: Set Up Dynamic DNS (If IP Changes)

**Option A - Use No-IP (Free):**
1. Sign up at https://www.noip.com
2. Create hostname: `schoolideas.ddns.net`
3. Install client on Pi:
   ```bash
   cd /usr/local/src/
   sudo wget http://www.noip.com/client/linux/noip-duc-linux.tar.gz
   sudo tar xf noip-duc-linux.tar.gz
   cd noip-2.1.9-1/
   sudo make install
   
   # Follow prompts to configure
   sudo /usr/local/bin/noip2 -C
   
   # Start service
   sudo /usr/local/bin/noip2
   ```

**Option B - Use Your Own Domain:**
1. Buy domain from Namecheap/Google Domains (~$10/year)
2. Point A record to your public IP
3. Update when IP changes (can automate with cron)

---

## Part 3: Create Docker Setup (30 minutes)

### Step 1: Project Structure

```bash
# On Raspberry Pi
mkdir -p ~/schoolideas
cd ~/schoolideas

# Create folders
mkdir -p frontend backend database nginx ssl
```

### Step 2: Create docker-compose.yml

```bash
nano docker-compose.yml
```

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  database:
    image: postgres:15-alpine
    container_name: schoolideas-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: schoolideas
      POSTGRES_USER: schooladmin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - ./database/data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - schoolideas-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U schooladmin"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API (Node.js)
  backend:
    build: ./backend
    container_name: schoolideas-api
    restart: unless-stopped
    depends_on:
      database:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: database
      DB_PORT: 5432
      DB_NAME: schoolideas
      DB_USER: schooladmin
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    networks:
      - schoolideas-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend (Static React build)
  frontend:
    image: nginx:alpine
    container_name: schoolideas-frontend
    restart: unless-stopped
    volumes:
      - ./frontend/build:/usr/share/nginx/html:ro
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    networks:
      - schoolideas-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: schoolideas-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl/certbot/conf:/etc/letsencrypt:ro
      - ./ssl/certbot/www:/var/www/certbot:ro
    depends_on:
      - frontend
      - backend
    networks:
      - schoolideas-network

  # Certbot for SSL
  certbot:
    image: certbot/certbot
    container_name: schoolideas-certbot
    volumes:
      - ./ssl/certbot/conf:/etc/letsencrypt
      - ./ssl/certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

networks:
  schoolideas-network:
    driver: bridge

volumes:
  db-data:
```

### Step 3: Create Environment File

```bash
nano .env
```

```bash
# Database
DB_PASSWORD=your_super_secure_db_password_here

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_key_here

# Domain
DOMAIN=schoolideas.yourdomain.com
# or
DOMAIN=schoolideas.ddns.net
```

**Generate secure passwords:**
```bash
# On Pi
openssl rand -base64 32
```

### Step 4: Create Database Init Script

```bash
nano database/init.sql
```

```sql
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users/Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'principal')),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ideas table
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  votes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'under-review', 'forwarded', 'approved', 'rejected')),
  principal_status VARCHAR(20) CHECK (principal_status IN ('pending', 'in-progress', 'approved', 'rejected', 'implemented')),
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  budget DECIMAL(10, 2),
  implementation_date DATE,
  teacher_notes TEXT,
  principal_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  forwarded_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, idea_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table (chat)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_ideas_author ON ideas(author_id);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_created ON ideas(created_at DESC);
CREATE INDEX idx_votes_idea ON votes(idea_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_comments_idea ON comments(idea_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ideas_updated_at
BEFORE UPDATE ON ideas
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert demo data
INSERT INTO profiles (email, username, full_name, password_hash, role) VALUES
('admin@school.com', 'admin', 'Admin User', '$2b$10$...', 'principal'),
('teacher@school.com', 'mrsmith', 'Mr. Smith', '$2b$10$...', 'teacher'),
('student@school.com', 'johnstudent', 'John Student', '$2b$10$...', 'student');
```

---

## Part 4: Create Backend API (45 minutes)

### Step 1: Backend Dockerfile

```bash
nano backend/Dockerfile
```

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start app
CMD ["node", "server.js"]
```

### Step 2: Backend package.json

```bash
nano backend/package.json
```

```json
{
  "name": "schoolideas-backend",
  "version": "1.0.0",
  "description": "School Ideas Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^7.1.5"
  }
}
```

### Step 3: Backend Server

```bash
nano backend/server.js
```

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/ideas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, p.username as author_name 
      FROM ideas i 
      JOIN profiles p ON i.author_id = p.id 
      ORDER BY i.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching ideas:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/ideas', async (req, res) => {
  const { title, description, category, author_id } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO ideas (title, description, category, author_id) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description, category, author_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating idea:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add more routes here...

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end();
  process.exit(0);
});
```

### Step 4: Health Check

```bash
nano backend/healthcheck.js
```

```javascript
const http = require('http');

const options = {
  host: 'localhost',
  port: 3000,
  timeout: 2000,
  path: '/health'
};

const request = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  process.exit(res.statusCode === 200 ? 0 : 1);
});

request.on('error', (err) => {
  console.log('ERROR:', err);
  process.exit(1);
});

request.end();
```

---

## Part 5: Configure Nginx (20 minutes)

### Step 1: Main Nginx Config

```bash
nano nginx/nginx.conf
```

```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:80;
    }

    upstream backend {
        server backend:3000;
    }

    server {
        listen 80;
        server_name ${DOMAIN};

        # Let's Encrypt validation
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # Redirect to HTTPS
        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name ${DOMAIN};

        # SSL Certificates
        ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

        # SSL Configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

        # Security Headers
        add_header Strict-Transport-Security "max-age=31536000" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # API Proxy
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # WebSocket support (for real-time features)
        location /ws {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

---

## Part 6: Get SSL Certificate (15 minutes)

### Step 1: Initial Setup (Without SSL)

```bash
# Start only nginx and certbot first
docker-compose up -d nginx certbot

# Wait 10 seconds
sleep 10
```

### Step 2: Get Certificate

```bash
# Request certificate
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d schoolideas.yourdomain.com

# Replace with your actual domain and email
```

### Step 3: Restart with SSL

```bash
# Bring everything up
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

## Part 7: Deploy Frontend (30 minutes)

### Step 1: Build React App (On Your Computer)

```bash
# On your development machine
cd school-ideas-app

# Update API endpoint
# Create .env.production file
echo "VITE_API_URL=https://schoolideas.yourdomain.com/api" > .env.production

# Build (Vite outDir: build)
npm run build
```

### Step 2: Transfer Build to Pi

```bash
# On your computer
# Compress build folder
tar -czf build.tar.gz build/

# Copy to Pi
scp build.tar.gz pi@192.168.1.100:~/schoolideas/frontend/

# SSH to Pi
ssh pi@192.168.1.100

# Extract
cd ~/schoolideas/frontend
tar -xzf build.tar.gz
# Result: ./frontend/build (no rename needed)
```

---

## Part 8: Start Everything (10 minutes)

### Step 1: Start All Services

```bash
cd ~/schoolideas

# Start all containers
docker-compose up -d

# Check status
docker-compose ps

# Watch logs
docker-compose logs -f
```

### Step 2: Verify Everything Works

```bash
# Check containers are running
docker ps

# Test database
docker exec schoolideas-db psql -U schooladmin -d schoolideas -c "SELECT COUNT(*) FROM profiles;"

# Test backend API
curl http://localhost:3000/health

# Test frontend
curl http://localhost

# Test from outside
curl https://schoolideas.yourdomain.com
```

---

## Part 9: Maintenance & Monitoring

### Daily Checks

```bash
# Check disk space
df -h

# Check container status
docker ps

# Check logs
docker-compose logs --tail=50
```

### Weekly Tasks

```bash
# Update Docker images
docker-compose pull
docker-compose up -d

# Clean up unused images
docker system prune -a

# Backup database
docker exec schoolideas-db pg_dump -U schooladmin schoolideas > backup_$(date +%Y%m%d).sql
```

### Automated Backups

```bash
# Create backup script
nano ~/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/pi/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker exec schoolideas-db pg_dump -U schooladmin schoolideas > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: db_$DATE.sql.gz"
```

```bash
# Make executable
chmod +x ~/backup.sh

# Schedule daily backup
crontab -e

# Add this line (runs at 2 AM daily):
0 2 * * * /home/pi/backup.sh
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs [service-name]

# Restart specific service
docker-compose restart [service-name]

# Rebuild
docker-compose up -d --build
```

### Can't Access from Internet

1. **Check port forwarding** in router
2. **Check firewall:**
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```
3. **Check public IP:** `curl ifconfig.me`
4. **Check DNS:** `nslookup schoolideas.yourdomain.com`

### Database Connection Issues

```bash
# Check database is running
docker exec schoolideas-db psql -U schooladmin -d schoolideas -c "SELECT 1;"

# Check environment variables
docker-compose config

# Reset database
docker-compose down -v
docker-compose up -d database
```

### SSL Certificate Issues

```bash
# Check certificate
docker-compose run --rm certbot certificates

# Renew manually
docker-compose run --rm certbot renew

# Test renewal
docker-compose run --rm certbot renew --dry-run
```

---

## Performance Optimization

### For Raspberry Pi 4:

```bash
# Increase swap size
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Change CONF_SWAPSIZE=2048
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### PostgreSQL Tuning:

```bash
nano database/postgresql.conf
```

```conf
# Raspberry Pi 4 (4GB RAM) optimizations
shared_buffers = 512MB
effective_cache_size = 1GB
maintenance_work_mem = 128MB
wal_buffers = 16MB
max_connections = 100
```

---

## Security Checklist

- [ ] Changed default passwords
- [ ] Enabled firewall
- [ ] Using HTTPS only
- [ ] Regular backups scheduled
- [ ] Rate limiting enabled
- [ ] SQL injection protection
- [ ] XSS protection headers
- [ ] CSRF tokens implemented
- [ ] Regular security updates
- [ ] Monitoring logs

---

## Cost Summary

| Item | One-Time | Annual |
|------|----------|--------|
| Raspberry Pi 4 | $55 | - |
| SD Card | $12 | - |
| Power Supply | $8 | - |
| Case | $10 | - |
| Domain | - | $10 |
| Electricity (~5W 24/7) | - | ~$5 |
| **Total** | **$85** | **$15** |

**vs. Cloud Hosting:**
- AWS/DigitalOcean: ~$20-50/month = $240-600/year
- Heroku: ~$25/month = $300/year

**Savings:** $225-585/year!

---

## ChatGPT Prompts for Help

**General Setup:**
```
I'm setting up a School Ideas web app on Raspberry Pi with Docker. I need help with:
[describe your specific issue]

My setup:
- Raspberry Pi 4 (4GB RAM)
- Raspberry Pi OS (64-bit)
- Docker and Docker Compose installed
- [add other relevant details]

Please provide step-by-step instructions.
```

**Networking Issues:**
```
I can't access my Raspberry Pi server from the internet. 

Current setup:
- Pi IP: 192.168.1.100
- Public IP: [your IP]
- Port forwarding: 80, 443 → 192.168.1.100
- Domain: schoolideas.yourdomain.com

What should I check?
```

**Docker Issues:**
```
My Docker container [name] won't start. 

Error message:
[paste error]

docker-compose.yml:
[paste relevant section]

How do I fix this?
```

---

## Next Steps

1. **Test thoroughly** on local network
2. **Configure port forwarding**
3. **Set up domain/DDNS**
4. **Get SSL certificate**
5. **Deploy and test from internet**
6. **Set up monitoring**
7. **Configure backups**
8. **Document admin procedures**

Good luck with your self-hosted deployment! 🚀🥧

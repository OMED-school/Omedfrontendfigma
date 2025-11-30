# 🎯 Deployment Checklist - School Ideas

**Use this checklist when deploying to ensure nothing is missed!**

---

## Pre-Deployment Checklist

### 📋 Requirements Gathered

- [ ] **Target users identified**
  - [ ] Number of students: _______
  - [ ] Number of teachers: _______
  - [ ] Number of administrators: _______

- [ ] **Deployment method chosen**
  - [ ] Raspberry Pi (self-hosted)
  - [ ] Cloud (Supabase/Vercel)
  - [ ] Other: _______

- [ ] **Domain name**
  - [ ] Purchased domain: _______
  - [ ] Or using subdomain: _______

- [ ] **Hardware ready** (if self-hosting)
  - [ ] Raspberry Pi 4 (4GB+ RAM)
  - [ ] MicroSD card (64GB+, Class 10)
  - [ ] Power supply
  - [ ] Ethernet cable or WiFi
  - [ ] Optional: Case with cooling

---

## Cloudflare Setup Checklist

### 🌐 Cloudflare Account

- [ ] **Created Cloudflare account** (https://cloudflare.com)
- [ ] **Added domain to Cloudflare**
  - Domain: _______________________
  - Status: ⬜ Pending ⬜ Active

- [ ] **Updated nameservers at registrar**
  - Cloudflare NS 1: _______________________
  - Cloudflare NS 2: _______________________
  - Status: ⬜ Pending ⬜ Propagated

- [ ] **DNS propagation verified** (wait 5-60 minutes)
  ```bash
  nslookup yourdomain.com
  # Should show Cloudflare IPs
  ```

### 🚇 Cloudflare Tunnel

- [ ] **Created Zero Trust account**
  - Team name: _______________________

- [ ] **Created tunnel**
  - Tunnel name: _______________________
  - Token saved: ⬜ Yes (keep secret!)

- [ ] **Configured public hostname**
  - Subdomain: _______________________
  - Full URL: https://_______________________
  - Service: HTTP → nginx:80

- [ ] **Tunnel status**
  - Status: ⬜ Inactive (normal until deployed) ⬜ Healthy

---

## Raspberry Pi Setup Checklist

### 🥧 Initial Setup

- [ ] **Flashed Raspberry Pi OS**
  - OS version: Raspberry Pi OS (64-bit)
  - Using: Raspberry Pi Imager

- [ ] **Configured Pi settings**
  - [ ] Hostname: _______________________
  - [ ] SSH enabled
  - [ ] Username: _______________________
  - [ ] Password: ⬜ Set (don't forget!)
  - [ ] WiFi configured (if using)
  - [ ] Timezone: _______________________

- [ ] **Pi booted successfully**
  - IP address: _______________________
  - Can SSH: ⬜ Yes

- [ ] **Updated system**
  ```bash
  sudo apt update && sudo apt upgrade -y
  ```

- [ ] **Installed Docker**
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker pi
  ```

- [ ] **Installed Docker Compose**
  ```bash
  sudo apt install -y docker-compose
  ```

- [ ] **Verified installations**
  ```bash
  docker --version
  docker-compose --version
  ```

### 📁 Project Structure

- [ ] **Created project directory**
  ```bash
  mkdir -p ~/schoolideas
  cd ~/schoolideas
  ```

- [ ] **Created subdirectories**
  ```bash
  mkdir -p backend frontend/build nginx database backups
  ```

### 🔐 Security Setup

- [ ] **Generated secure passwords**
  ```bash
  # Database password
  openssl rand -base64 32
  
  # JWT secret
  openssl rand -base64 32
  ```

- [ ] **Created .env file**
  - [ ] CLOUDFLARE_TUNNEL_TOKEN=_______________
  - [ ] DB_USER=_______________
  - [ ] DB_PASSWORD=_______________ (from above)
  - [ ] JWT_SECRET=_______________ (from above)
  - [ ] DOMAIN=_______________

- [ ] **Set file permissions**
  ```bash
  chmod 600 .env
  ```

---

## Application Setup Checklist

### 💻 Frontend Build

- [ ] **Built React app** (on development computer)
  ```bash
  cd school-ideas-app
  npm install
  npm run build
  ```

- [ ] **Created .env.production**
  ```
  VITE_API_URL=https://schoolideas.yourdomain.com/api
  ```

- [ ] **Compressed build**
  ```bash
  tar -czf frontend.tar.gz dist/
  ```

- [ ] **Uploaded to Pi**
  ```bash
  scp frontend.tar.gz pi@IP:~/schoolideas/
  ```

- [ ] **Extracted on Pi**
  ```bash
  cd ~/schoolideas
  tar -xzf frontend.tar.gz -C frontend/
  mv frontend/dist/* frontend/build/
  ```

### 🔧 Backend Setup

- [ ] **Prepared backend code**
  - [ ] package.json created
  - [ ] server.js created
  - [ ] Dockerfile created
  - [ ] Environment variables configured

- [ ] **Uploaded backend** (if not using git)
  ```bash
  scp -r backend/* pi@IP:~/schoolideas/backend/
  ```

### 🗄️ Database Setup

- [ ] **Created init.sql**
  - [ ] Schema copied
  - [ ] Indexes added
  - [ ] Triggers configured
  - [ ] Demo data (optional)

- [ ] **Uploaded to Pi**
  ```bash
  scp database/init.sql pi@IP:~/schoolideas/database/
  ```

### 🔄 Nginx Configuration

- [ ] **Created nginx.conf**
  - [ ] Frontend routing
  - [ ] API proxy
  - [ ] WebSocket support
  - [ ] Security headers
  - [ ] Gzip compression

- [ ] **Uploaded to Pi**
  ```bash
  scp nginx/nginx.conf pi@IP:~/schoolideas/nginx/
  ```

### 🐳 Docker Compose

- [ ] **Created docker-compose.yml**
  - [ ] Cloudflared service
  - [ ] Nginx service
  - [ ] Backend service
  - [ ] Database service
  - [ ] Backup service
  - [ ] Network configuration
  - [ ] Volume configuration

- [ ] **Validated YAML**
  ```bash
  docker-compose config
  # Should show no errors
  ```

---

## Deployment Checklist

### 🚀 Initial Launch

- [ ] **Started services**
  ```bash
  cd ~/schoolideas
  docker-compose up -d
  ```

- [ ] **Checked container status**
  ```bash
  docker-compose ps
  # All services should show "Up"
  ```

- [ ] **Verified tunnel connection**
  - [ ] Cloudflare dashboard shows "Healthy"
  - [ ] Green checkmark visible

- [ ] **Checked logs**
  ```bash
  docker-compose logs -f
  # Look for errors
  ```

### ✅ Verification Tests

- [ ] **Health checks**
  ```bash
  # Backend health
  curl http://localhost:3000/health
  # Should return: {"status":"healthy"}
  
  # Nginx health
  curl http://localhost:80/health
  # Should return: healthy
  ```

- [ ] **Database connectivity**
  ```bash
  docker exec schoolideas-db psql -U schooladmin -d schoolideas -c "SELECT 1;"
  # Should return: 1
  ```

- [ ] **External access**
  ```bash
  curl https://schoolideas.yourdomain.com
  # Should return HTML
  
  curl https://schoolideas.yourdomain.com/api/health
  # Should return: {"status":"healthy"}
  ```

- [ ] **Browser test**
  - [ ] Visited https://schoolideas.yourdomain.com
  - [ ] App loaded successfully
  - [ ] No console errors
  - [ ] Can navigate between views

### 🔍 Functionality Testing

- [ ] **Student features**
  - [ ] Can view ideas
  - [ ] Can vote (up/down)
  - [ ] Can submit new idea
  - [ ] Can comment
  - [ ] Can view profile
  - [ ] Can access chat

- [ ] **Teacher features**
  - [ ] Dashboard loads
  - [ ] Can see statistics
  - [ ] Can filter ideas
  - [ ] Can review ideas
  - [ ] Can forward to principal

- [ ] **Principal features**
  - [ ] Dashboard loads
  - [ ] Can see all forwarded ideas
  - [ ] Can approve with budget
  - [ ] Can reject with reason
  - [ ] Can set priorities

- [ ] **Real-time features** (if implemented)
  - [ ] Chat works
  - [ ] Vote updates in real-time
  - [ ] New comments appear

### 📱 Mobile Testing

- [ ] **Responsive design**
  - [ ] Tested on phone
  - [ ] Tested on tablet
  - [ ] Tested on desktop

- [ ] **PWA install**
  - [ ] Install prompt appears
  - [ ] Can install to home screen
  - [ ] App works when installed
  - [ ] Offline mode works

### 🔐 Security Verification

- [ ] **HTTPS working**
  - [ ] Certificate valid
  - [ ] No mixed content warnings
  - [ ] All requests use HTTPS

- [ ] **Access control** (if configured)
  - [ ] Login required for protected routes
  - [ ] Role-based permissions work
  - [ ] JWT tokens working

- [ ] **Headers check**
  ```bash
  curl -I https://schoolideas.yourdomain.com
  # Should see security headers:
  # X-Frame-Options: SAMEORIGIN
  # X-Content-Type-Options: nosniff
  # X-XSS-Protection: 1; mode=block
  ```

---

## Post-Deployment Checklist

### 📊 Monitoring Setup

- [ ] **Cloudflare Analytics enabled**
  - Dashboard → Analytics → Overview

- [ ] **Log rotation configured**
  ```bash
  # Docker automatically rotates logs
  # Verify in daemon.json
  ```

- [ ] **Database backups working**
  ```bash
  # Check backup container
  docker-compose logs backup
  
  # Verify backups exist
  ls -lh ~/schoolideas/backups/
  ```

### 📧 Notifications Setup (Optional)

- [ ] **Cloudflare email alerts**
  - Zero Trust → Notifications
  - Configure for:
    - [ ] Tunnel down
    - [ ] Certificate expiring
    - [ ] Suspicious activity

### 📝 Documentation

- [ ] **Credentials saved securely**
  - [ ] .env file backed up (encrypted!)
  - [ ] Cloudflare tunnel token saved
  - [ ] Database passwords documented
  - [ ] Admin account credentials

- [ ] **Network information documented**
  - [ ] Raspberry Pi IP: _______
  - [ ] Domain: _______
  - [ ] Cloudflare account email: _______

- [ ] **Created runbook**
  - [ ] How to restart services
  - [ ] How to backup database
  - [ ] How to restore from backup
  - [ ] Emergency contacts

### 👥 User Onboarding

- [ ] **Created demo accounts**
  - [ ] Student demo account
  - [ ] Teacher demo account
  - [ ] Principal demo account

- [ ] **Prepared training materials**
  - [ ] Student guide
  - [ ] Teacher guide
  - [ ] Admin guide

- [ ] **Communication plan**
  - [ ] Announcement ready
  - [ ] Email to students
  - [ ] Email to teachers
  - [ ] Email to principals

---

## Maintenance Checklist

### 📅 Daily

- [ ] **Check service status**
  ```bash
  docker-compose ps
  ```

- [ ] **Monitor logs for errors**
  ```bash
  docker-compose logs --tail=50
  ```

### 📅 Weekly

- [ ] **Review Cloudflare analytics**
  - Traffic patterns
  - Error rates
  - Geographic distribution

- [ ] **Check disk space**
  ```bash
  df -h
  # Should have >20% free
  ```

- [ ] **Verify backups exist**
  ```bash
  ls -lh ~/schoolideas/backups/
  ```

### 📅 Monthly

- [ ] **Update Docker images**
  ```bash
  docker-compose pull
  docker-compose up -d
  ```

- [ ] **Update Raspberry Pi OS**
  ```bash
  sudo apt update && sudo apt upgrade -y
  ```

- [ ] **Review and clean old backups**
  ```bash
  # Keep last 30 days only
  find ~/schoolideas/backups/ -name "*.sql" -mtime +30 -delete
  ```

- [ ] **Test backup restoration** (important!)
  ```bash
  # Create test database
  # Restore latest backup
  # Verify data integrity
  ```

---

## Troubleshooting Quick Reference

### 🔴 Tunnel Shows Inactive

```bash
# Check cloudflared logs
docker-compose logs cloudflared

# Verify token in .env
cat .env | grep CLOUDFLARE_TUNNEL_TOKEN

# Restart tunnel
docker-compose restart cloudflared
```

### 🔴 502 Bad Gateway

```bash
# Check nginx status
docker-compose ps nginx

# Check backend status
docker-compose ps backend

# Check nginx logs
docker-compose logs nginx

# Restart services
docker-compose restart nginx backend
```

### 🔴 Database Connection Failed

```bash
# Check database status
docker-compose ps database

# Test connection
docker exec schoolideas-db psql -U schooladmin -d schoolideas -c "SELECT 1;"

# Check database logs
docker-compose logs database

# Restart database
docker-compose restart database
```

### 🔴 Out of Disk Space

```bash
# Check space
df -h

# Clean Docker
docker system prune -a

# Remove old logs
sudo journalctl --vacuum-size=100M

# Remove old backups
find ~/schoolideas/backups/ -name "*.sql" -mtime +7 -delete
```

---

## Success Criteria

### ✅ Deployment Successful When:

- [x] All containers running (docker-compose ps shows "Up")
- [x] Tunnel shows "Healthy" in Cloudflare
- [x] Can access app at https://yourdomain.com
- [x] Login works (if auth implemented)
- [x] Can submit/vote/comment
- [x] Teacher dashboard accessible
- [x] Principal dashboard accessible
- [x] Mobile responsive
- [x] PWA installable
- [x] HTTPS certificate valid
- [x] Database backups working
- [x] No errors in logs

### 🎉 Ready for Users When:

- [x] All success criteria met
- [x] Demo accounts tested
- [x] Performance acceptable
- [x] Monitoring set up
- [x] Backup verified
- [x] Documentation complete
- [x] Training materials ready
- [x] Support plan in place

---

## Rollback Plan

If something goes wrong:

### Quick Rollback

```bash
# Stop all services
docker-compose down

# Restore previous version
# (if you kept old docker-compose.yml)
mv docker-compose.yml docker-compose.yml.new
mv docker-compose.yml.backup docker-compose.yml

# Start with old version
docker-compose up -d
```

### Database Rollback

```bash
# Stop services
docker-compose down

# Restore database from backup
cat backups/backup_YYYYMMDD.sql | docker exec -i schoolideas-db psql -U schooladmin schoolideas

# Restart services
docker-compose up -d
```

---

## Notes & Observations

**Deployment Date:** _______________________

**Deployed By:** _______________________

**Issues Encountered:**
```
[Record any issues and how they were resolved]





```

**Performance Notes:**
```
[Record initial performance metrics]





```

**Next Steps:**
```
[What to do next]





```

---

## Signatures

**Deployed and Verified By:**

Name: _________________________ Date: _____________

**Approved for Production:**

Name: _________________________ Date: _____________

---

**Remember:** 
- ✅ Don't rush - check each item carefully
- ✅ Test thoroughly before users access
- ✅ Keep backups before making changes
- ✅ Document everything
- ✅ Ask for help when stuck

**Good luck with your deployment!** 🚀

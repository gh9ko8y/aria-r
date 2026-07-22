# Aria·R 部署指南

## 部署步骤

### 1. 上传文件到服务器

在 Windows 上打开 PowerShell，运行以下命令：

```powershell
# 上传前端包
scp "D:\Aria R\aria-r-frontend.zip" root@8.130.32.219:/tmp/

# 上传后端包
scp "D:\Aria R\aria-r-backend.zip" root@8.130.32.219:/tmp/

# 上传部署脚本
scp "D:\Aria R\deploy.sh" root@8.130.32.219:/tmp/
```

### 2. 连接到服务器

```powershell
ssh root@8.130.32.219
```

### 3. 运行部署脚本

```bash
chmod +x /tmp/deploy.sh
sudo /tmp/deploy.sh
```

### 4. 配置后端环境变量

```bash
# 编辑后端配置
nano /opt/aria-r-backend/.env
```

添加以下内容：
```
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=209684152@qq.com
SMTP_PASS=vpvayeqwyvwfcaib
PORT=3001
```

### 5. 重启后端服务

```bash
cd /opt/aria-r-backend
pm2 restart aria-r-backend
```

## 访问应用

- 前端: http://8.130.32.219
- 后端 API: http://8.130.32.219/api/

## 常用命令

```bash
# 查看后端日志
pm2 logs aria-r-backend

# 重启后端
pm2 restart aria-r-backend

# 查看 Nginx 状态
systemctl status nginx

# 重启 Nginx
sudo systemctl restart nginx

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

## 文件位置

- 前端文件: /var/www/aria-r/
- 后端文件: /opt/aria-r-backend/
- Nginx 配置: /etc/nginx/sites-available/aria-r
- PM2 配置: ~/.pm2/

# Terraform Infrastructure Setup - Complete Guide

Complete Infrastructure-as-Code for static web hosting on AWS with CloudFront, Route 53, and S3.

## 📋 Overview

This setup provides **production-ready infrastructure** for hosting the HDS site with:
- Global CDN distribution (CloudFront)
- Managed DNS (Route 53)
- Secure S3 storage with versioning
- Automatic SSL/TLS certificates (ACM)
- Automated deployments (GitHub Actions)
- Infrastructure as Code (Terraform)

**Total Setup Time**: ~20-30 minutes  
**Estimated Monthly Cost**: $10-50 depending on traffic

## 📁 Files Created

### Terraform Infrastructure Code (in `terraform/`)

| File | Lines | Purpose |
|------|-------|---------|
| `provider.tf` | 28 | AWS provider configuration |
| `variables.tf` | 73 | Input variables for customization |
| `main.tf` | 280+ | CloudFront, Route 53, ACM resources |
| `s3.tf` | 150+ | S3 buckets with security configurations |
| `outputs.tf` | 45 | Output values for easy reference |

**Total Infrastructure Code**: ~600 lines

### Configuration & Templates

| File | Purpose |
|------|---------|
| `terraform/terraform.tfvars.example` | Template for your variables (copy to `terraform.tfvars`) |
| `terraform/.gitignore` | Prevent accidental commits of sensitive state files |

### Documentation (in `terraform/`)

| File | Pages | Purpose |
|------|-------|---------|
| `README.md` | 15+ | Complete setup and configuration guide |
| `DEPLOYMENT.md` | 12+ | Step-by-step deployment instructions |
| `QUICKREF.md` | 8+ | Command reference and shortcuts |

### Automation & Scripts

| File | Type | Purpose |
|------|------|---------|
| `Makefile` | Make | Convenient targets: `make init`, `make deploy`, etc. |
| `deploy.ps1` | PowerShell | Windows deployment script |
| `deploy.bat` | Batch | Windows deployment script (cmd.exe) |

### CI/CD Workflows (in `.github/workflows/`)

| File | Trigger | Purpose |
|------|---------|---------|
| `deploy.yml` | Push to main | Automatic deployment on code changes |
| `terraform-plan.yml` | Pull request | Review infrastructure changes before merge |

### Project Documentation

| File | Purpose |
|------|---------|
| `TERRAFORM_SETUP.md` | Quick start and architecture overview (this folder) |

## 🚀 Quick Start (5 Minutes)

### Step 1: Configure Domain
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your domain:
# domain_name = "yourdomain.com"
# subdomain = "www"
```

### Step 2: Deploy Infrastructure
```bash
terraform init
terraform apply
# Wait 5-15 minutes for SSL certificate validation
```

### Step 3: Deploy Site
```bash
# From project root
npm run build
make deploy-all
```

That's it! Your site is now live at `https://www.yourdomain.com`

## 🎯 What Gets Created

### On AWS

1. **S3 Buckets**
   - Production bucket for site content
   - Optional redirect bucket for domain aliases
   - Versioning, encryption, public access blocked

2. **CloudFront Distribution(s)**
   - Global CDN with edge locations worldwide
   - Smart caching: no-cache HTML, 1-year static assets
   - Automatic compression (gzip/brotli)
   - SPA routing support

3. **Route 53 DNS**
   - A records (IPv4) pointing to CloudFront
   - AAAA records (IPv6) pointing to CloudFront
   - DNS validation for SSL certificate

4. **ACM Certificate**
   - Free SSL/TLS certificate
   - Automatic renewal
   - Minimum TLS 1.2

### On Your Machine

After running `terraform apply`:
- S3 bucket for your site files
- CloudFront distribution domains
- DNS records configured
- SSL certificate validated

Get these with: `terraform output`

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Route 53 (DNS)                      │
│              www.yourdomain.com → A/AAAA                │
└────────────────────────────┬────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────┐
│                    CloudFront (CDN)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Edge Locations (60+ worldwide)                   │   │
│  │ - Cache static assets (1 year)                   │   │
│  │ - Cache HTML (no cache)                          │   │
│  │ - Compress responses                             │   │
│  │ - HTTPS enforcement                              │   │
│  └────────────────────────┬────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────┐
│                   Origin Access Identity                │
│        (Secure S3 access, no public internet)           │
└────────────────────────────┬────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────┐
│                      S3 Bucket                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Static Site Files                                │   │
│  │ - index.html                                    │   │
│  │ - assets/                                       │   │
│  │ - Versioning enabled                            │   │
│  │ - Server-side encryption (AES-256)              │   │
│  │ - Public access blocked                         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 📝 Deployment Workflow

### Initial Setup (One-time)
```
1. Configure Terraform variables
2. terraform init
3. terraform apply (creates infrastructure)
4. Wait for SSL validation (5-15 min)
```

### Regular Deployments
```
1. npm run build (builds site)
2. make deploy (uploads to S3)
3. make invalidate (refreshes CDN)
Or: make deploy-all (all 3 in one)
```

### Automated Deployments (GitHub Actions)
```
1. Push to main branch
2. GitHub Actions automatically builds and deploys
3. Site updates within seconds
```

## 🔧 Key Commands

### Infrastructure Management
```bash
terraform init          # Initialize Terraform
terraform plan          # Preview changes
terraform apply         # Deploy infrastructure
terraform output        # Show outputs
terraform destroy       # Remove all resources (be careful!)
```

### Build & Deploy
```bash
npm run build           # Build site
make deploy             # Upload to S3
make invalidate         # Clear CDN cache
make deploy-all         # All three above
```

### Status & Debugging
```bash
make status             # Show deployment status
make check              # Verify prerequisites
terraform output -json  # Show all outputs
aws s3 ls s3://...     # List S3 files
```

### Windows (PowerShell)
```powershell
./deploy.ps1 build      # Build site
./deploy.ps1 deploy     # Deploy to S3
./deploy.ps1 all        # Full deployment
./deploy.ps1 status     # Show status
```

### Windows (Command Prompt)
```cmd
deploy.bat check        # Check prerequisites
deploy.bat build        # Build site
deploy.bat deploy       # Deploy to S3
deploy.bat all          # Full deployment
```

## 📚 Documentation Map

Start here based on your needs:

**New to Infrastructure?**
→ [TERRAFORM_SETUP.md](TERRAFORM_SETUP.md) - Overview and quick start

**Setting Up for First Time?**
→ [terraform/README.md](terraform/README.md) - Complete setup guide

**Deploying Your Site?**
→ [terraform/DEPLOYMENT.md](terraform/DEPLOYMENT.md) - Step-by-step deployment

**Need Command Reference?**
→ [terraform/QUICKREF.md](terraform/QUICKREF.md) - Command cheatsheet

**Need Build Instructions?**
→ [Makefile](Makefile) - View available targets

## 💰 Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| **S3 Storage** | $0.02-2/mo | ~$0.023 per GB/month |
| **CloudFront** | $0.085/GB | Most of the cost |
| **Route 53** | $0.50/zone | Plus ~$0.40/M queries |
| **ACM Cert** | FREE | AWS provided |
| **Total** | **$10-50/mo** | For typical site |

High-traffic sites may cost more due to CloudFront bandwidth.

## 🔒 Security Features

✅ **Built In**
- HTTPS/TLS 1.2+ enforced
- All traffic encrypted
- S3 blocked from public access
- Origin Access Identity for secure S3 access
- Server-side encryption (AES-256)
- Versioning for rollback

✅ **Optional**
- AWS WAF integration
- Access logging (CloudFront, S3)
- Custom domain for everything

## ✨ Features

✅ **Static Site Hosting**
- S3 backend for file storage
- Automatic index.html serving
- Custom 404 → index.html (SPA routing)

✅ **CDN Distribution**
- 60+ edge locations worldwide
- Automatic cache optimization
- Gzip/Brotli compression

✅ **DNS Management**
- Route 53 integration
- IPv4 & IPv6 support
- Alias records to CloudFront

✅ **SSL/TLS**
- Automatic certificate management
- Free AWS Certificate Manager
- Automatic renewal

✅ **Automation**
- GitHub Actions CI/CD
- Automatic deployments on push
- Plan review on pull requests

✅ **Monitoring**
- Terraform outputs
- AWS CLI integration
- CloudWatch metrics support

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Domain not resolving | Check Route 53 records with `aws route53 list-resource-record-sets` |
| SSL certificate error | Wait 5-15 minutes for DNS validation, check ACM certificate status |
| CloudFront 403 error | Verify S3 bucket policy includes CloudFront OAI |
| Slow performance | Check CloudFront cache hit ratio, adjust TTL settings |
| Deployment fails | Verify AWS credentials: `aws sts get-caller-identity` |

See [terraform/DEPLOYMENT.md](terraform/DEPLOYMENT.md) for more troubleshooting.

## 🔄 CI/CD Integration

GitHub Actions workflows automatically:

1. **On Push to `main`**
   - Build React app
   - Upload to S3
   - Invalidate CloudFront
   - Deploy complete in ~2 minutes

2. **On Pull Request**
   - Run Terraform plan
   - Show infrastructure changes
   - Request review before merge

Requires: AWS IAM role configured (see `.github/workflows/deploy.yml`)

## 📦 Dependencies

Required:
- Terraform >= 1.0
- AWS CLI >= 2.0
- AWS Account with appropriate permissions
- Registered domain

Optional:
- Node.js (for local builds)
- Make (for convenient commands)
- GitHub account (for CI/CD)

## 🎓 Learning Resources

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [AWS CloudFront Guide](https://docs.aws.amazon.com/cloudfront/)
- [AWS Route 53 Guide](https://docs.aws.amazon.com/route53/)
- [S3 Static Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

## 📞 Support

For issues:

1. Check [terraform/DEPLOYMENT.md](terraform/DEPLOYMENT.md) troubleshooting
2. Review [terraform/QUICKREF.md](terraform/QUICKREF.md) for common commands
3. Check AWS CloudFormation/Terraform documentation
4. Review GitHub Actions logs for deployment issues

## ✅ Next Steps

1. **Configure**: Edit `terraform/terraform.tfvars`
2. **Deploy Infrastructure**: Run `terraform apply`
3. **Build Site**: Run `npm run build`
4. **Deploy Site**: Run `make deploy-all`
5. **Verify**: Visit your domain and check status with `make status`

## 📝 Notes

- All Terraform state is local by default (stored in `.terraform.tfstate`)
- To use remote state, add a `backend` block in `provider.tf`
- S3 bucket names must be globally unique
- SSL certificate validation is automatic via DNS
- CloudFront cache invalidation is instant but propagates over ~60 seconds

---

**Ready?** Start with Step 1 under "Quick Start" above!

For detailed information, see the documentation in `terraform/` folder.

# Terraform Infrastructure for Static Web Hosting

Complete infrastructure-as-code setup for hosting the HDS site on AWS with CloudFront and Route 53.

## 📁 What's Been Created

### Core Terraform Files (in `/terraform`)

| File | Purpose |
|------|---------|
| `provider.tf` | AWS provider configuration with multi-region support |
| `variables.tf` | Input variables for customization |
| `main.tf` | CloudFront distributions, Route 53 DNS, ACM certificates |
| `s3.tf` | S3 buckets with security, versioning, encryption |
| `outputs.tf` | Output values for easy reference |

### Configuration & Examples

| File | Purpose |
|------|---------|
| `terraform.tfvars.example` | Template for your terraform variables |
| `.gitignore` | Prevent accidental commits of sensitive data |

### Documentation

| File | Purpose |
|------|---------|
| `terraform/README.md` | Complete Terraform setup guide |
| `terraform/DEPLOYMENT.md` | Step-by-step deployment instructions |
| `terraform/QUICKREF.md` | Command reference and aliases |
| `Makefile` | Convenient make targets for common tasks |

### CI/CD Automation

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | Automatic deployment on push to main |
| `.github/workflows/terraform-plan.yml` | Plan review on pull requests |

## 🚀 Quick Start

### 1. Initial Setup

```bash
# Navigate to project root
cd hds-site

# Copy Terraform variables template
cp terraform/terraform.tfvars.example terraform/terraform.tfvars

# Edit with your domain
vim terraform/terraform.tfvars
# Set: domain_name = "yourdomain.com"

# Initialize and deploy
cd terraform
terraform init
terraform apply
```

### 2. Deploy Site

```bash
# From project root
npm run build
make deploy-all
```

Or use the individual commands:

```bash
make build      # Build site
make deploy     # Upload to S3
make invalidate # Refresh CDN cache
```

## 📋 Key Features

✅ **S3 Buckets**
- Secure static file storage
- Versioning enabled for rollbacks
- Server-side encryption (AES-256)
- Public access blocked, CloudFront-only

✅ **CloudFront Distribution**
- Global CDN for low-latency delivery
- Automatic compression (gzip/brotli)
- Smart caching:
  - HTML: No cache (always fresh)
  - Static assets: 1 year cache
  - Other files: 1 hour cache
- SPA routing support (404 → index.html)

✅ **Route 53 DNS**
- DNS management integrated with infrastructure
- A and AAAA records (IPv4 & IPv6)
- Alias records pointing to CloudFront

✅ **SSL/TLS Security**
- Free AWS Certificate Manager certificate
- Automatic DNS validation
- TLS 1.2 minimum
- SNI support

✅ **Optional Features**
- Subdomain redirect (www ↔ apex domain)
- Custom bucket names
- Configurable cache TTLs
- Tagging for cost tracking

## 📊 Architecture

```
Domain (Route 53)
    ↓
    └─ A Record → CloudFront Distribution
           ↓
           └─ Origin Access Identity
                  ↓
                  └─ S3 Bucket (Private)
                         ↓
                         └─ Static Site Files
```

## 💰 Estimated Monthly Costs

| Service | Cost | Notes |
|---------|------|-------|
| S3 Storage | $0.02-5 | Depends on size |
| CloudFront | $0.085/GB | Varies by region |
| Route 53 | $0.50/zone | Plus DNS queries |
| ACM Cert | FREE | AWS provided |
| **Total** | **~$10-50** | For typical site |

## 🔒 Security Features

- ✅ All traffic HTTPS enforced
- ✅ S3 buckets blocked from public access
- ✅ Origin Access Identity for S3 access
- ✅ Server-side encryption enabled
- ✅ Versioning for rollback capability
- ✅ No hardcoded credentials

## 📝 Next Steps

### 1. Configure Your Domain

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars:
# - Set domain_name to your registered domain
# - Set subdomain (www recommended)
# - Adjust other settings as needed
```

### 2. Deploy Infrastructure

```bash
terraform init
terraform plan
terraform apply
# Wait 5-15 minutes for SSL cert validation
```

### 3. Deploy Your Site

```bash
# From project root
npm run build
make deploy-all
```

### 4. Verify Deployment

```bash
# Check DNS
nslookup www.yourdomain.com

# Test HTTPS
curl -vI https://www.yourdomain.com

# Check S3
make status
```

## 🔧 Common Commands

```bash
# Terraform
make init              # Initialize Terraform
make plan              # Review infrastructure changes
make apply             # Deploy infrastructure
terraform output       # Show outputs

# Build & Deploy
make build            # Build site for production
make deploy           # Upload to S3
make invalidate       # Clear CDN cache
make deploy-all       # Build + Deploy + Invalidate

# Status & Debugging
make status           # Show deployment status
make check            # Verify prerequisites
make clean            # Clean build artifacts
```

## 📚 Documentation

Detailed documentation available in:

- **[terraform/README.md](terraform/README.md)** - Complete setup guide
- **[terraform/DEPLOYMENT.md](terraform/DEPLOYMENT.md)** - Step-by-step deployment
- **[terraform/QUICKREF.md](terraform/QUICKREF.md)** - Command reference
- **[Makefile](Makefile)** - Available make targets

## 🆘 Troubleshooting

### Domain Not Resolving

```bash
# Check DNS records
aws route53 list-resource-record-sets --hosted-zone-id <zone-id>

# Test DNS resolution
nslookup www.yourdomain.com
dig www.yourdomain.com
```

### SSL Certificate Error

```bash
# Check certificate status
aws acm describe-certificate --certificate-arn <cert-arn>

# Verify DNS validation records created
aws route53 list-resource-record-sets --hosted-zone-id <zone-id> | grep -A5 "_acm"
```

### CloudFront Returns 403

```bash
# Verify bucket policy
aws s3api get-bucket-policy --bucket <bucket-name>

# Check OAI in distribution
aws cloudfront get-distribution --id <dist-id>
```

### Slow Performance

```bash
# Check cache hit ratio
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name CacheHitRate \
  --dimensions Name=DistributionId,Value=<dist-id> \
  --start-time <date> --end-time <date> \
  --period 3600 --statistics Average
```

## 🔄 CI/CD Integration

Automated workflows available:

- **On Push to `main`**: Automatically build and deploy
- **On Pull Request**: Terraform plan review
- **Manual Trigger**: Run deployment manually

See `.github/workflows/` for details.

## 📦 What Gets Deployed

When you run `make deploy-all`:

1. **Build Phase**
   - Vite builds optimized production bundle
   - Assets get content-hash fingerprints for cache busting

2. **Deploy Phase**
   - Files uploaded to S3 with appropriate cache headers
   - index.html: `Cache-Control: max-age=0` (no cache)
   - Assets: `Cache-Control: max-age=31536000` (1 year)

3. **CDN Phase**
   - CloudFront cache invalidated for all paths
   - Global CDN refreshed within seconds

## 🎯 Production Readiness

This setup includes:

- ✅ Infrastructure as Code (Terraform)
- ✅ Automated testing and planning (GitHub Actions)
- ✅ SSL/TLS encryption
- ✅ Global CDN distribution
- ✅ DDoS protection (CloudFront)
- ✅ Versioning and rollback capability
- ✅ Cost monitoring and optimization
- ✅ Security best practices

## 📞 Support & Resources

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS Route 53 Documentation](https://docs.aws.amazon.com/route53/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)

---

**Ready to deploy?** Start with `make check` to verify prerequisites, then follow the Quick Start guide above!

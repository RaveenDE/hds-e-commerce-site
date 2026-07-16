# Deployment Guide

This guide covers deploying your HDS site using Terraform-managed infrastructure with CloudFront and Route 53.

## Quick Start

### 1. Initial Infrastructure Setup

```bash
# Configure your domain and settings
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your domain details

# Initialize and deploy infrastructure
terraform init
terraform plan
terraform apply
# Wait for DNS validation (5-15 minutes)
```

### 2. Build and Deploy Site

```bash
# From project root
npm run build

# Deploy to S3
export BUCKET_NAME=$(cd terraform && terraform output -raw s3_bucket_name)
node scripts/deploy-s3.mjs

# Invalidate CloudFront cache
export DISTRIBUTION_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths '/*'
```

## Step-by-Step Deployment

### Prerequisites Check

Verify you have everything ready:

```bash
# Check Terraform installed
terraform -v

# Check AWS CLI configured
aws sts get-caller-identity

# Check domain registered
# Domain should be registered and Route 53 hosted zone should exist or create_hosted_zone = true
```

### Environment Setup

```bash
# From terraform directory
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars
# Minimum required changes:
# - Set domain_name to your registered domain
# - Optionally set subdomain (default: www)
# - Optionally adjust caching settings
```

### Example terraform.tfvars

```hcl
domain_name = "mydomain.com"
subdomain   = "www"
aws_region  = "us-east-1"
project_name = "hds-site"
environment  = "production"

cache_ttl_default = 3600
cache_ttl_max     = 86400

enable_compression = true
tags = {
  Environment = "production"
  Team        = "Platform"
}
```

### Infrastructure Deployment

```bash
cd terraform

# 1. Initialize Terraform
terraform init

# 2. Review what will be created
terraform plan

# 3. Deploy infrastructure
terraform apply

# Confirm with: yes

# 4. Wait for SSL certificate validation
# This happens automatically via DNS but may take 5-15 minutes
```

### Building the Site

```bash
# From project root
npm install
npm run build

# This creates the dist/ directory with optimized assets
```

### Deploying to S3

```bash
# Option 1: Using the provided deployment script
export BUCKET_NAME="hds-website-bucket"  # or get from terraform output
node scripts/deploy-s3.mjs

# Option 2: Manual AWS CLI
aws s3 sync dist/ s3://$(cd terraform && terraform output -raw s3_bucket_name) --delete

# Option 3: AWS SDK programmatically
aws s3 cp dist/index.html s3://$(cd terraform && terraform output -raw s3_bucket_name)/index.html --cache-control "max-age=0"
```

### Invalidate CloudFront Cache

After deployment, refresh the CloudFront cache:

```bash
DISTRIBUTION_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths '/*'

# Verify invalidation
aws cloudfront list-invalidations --distribution-id $DISTRIBUTION_ID
```

## Automated Deployment Script

Create a deployment script (`deploy.sh`):

```bash
#!/bin/bash
set -e

echo "🔨 Building site..."
npm run build

echo "📤 Deploying to S3..."
BUCKET_NAME=$(cd terraform && terraform output -raw s3_bucket_name)
aws s3 sync dist/ s3://$BUCKET_NAME --delete --quiet

echo "♻️  Invalidating CloudFront cache..."
DISTRIBUTION_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths '/*' --query 'Invalidation.Id' --output text

echo "✅ Deployment complete!"
echo "🌐 Visit: $(cd terraform && terraform output -raw website_domain)"
```

Make it executable:

```bash
chmod +x deploy.sh
```

Run deployment:

```bash
./deploy.sh
```

## Accessing Terraform Outputs

After initial `terraform apply`, retrieve deployment information:

```bash
cd terraform

# Get S3 bucket name
terraform output -raw s3_bucket_name

# Get CloudFront distribution ID
terraform output -raw cloudfront_distribution_id

# Get website domain
terraform output -raw website_domain

# Get all outputs formatted
terraform output
```

## Monitoring Deployment

### Check S3 Bucket

```bash
# List uploaded files
aws s3 ls s3://$(cd terraform && terraform output -raw s3_bucket_name) --recursive

# Check file size
aws s3 ls s3://$(cd terraform && terraform output -raw s3_bucket_name) --summarize
```

### Check CloudFront Status

```bash
# Get distribution status
aws cloudfront get-distribution \
  --id $(cd terraform && terraform output -raw cloudfront_distribution_id)

# Check distribution metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=$(cd terraform && terraform output -raw cloudfront_distribution_id) \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum
```

### Check DNS Resolution

```bash
# Verify DNS is resolving
nslookup $(cd terraform && terraform output -raw website_domain)

# Or with dig
dig $(cd terraform && terraform output -raw website_domain)

# Check what CloudFront it resolves to
dig $(cd terraform && terraform output -raw website_domain) | grep CNAME
```

## Troubleshooting

### Site Not Loading

1. **Check DNS Resolution**
   ```bash
   nslookup www.mydomain.com
   # Should resolve to CloudFront domain name
   ```

2. **Check CloudFront Distribution Status**
   ```bash
   aws cloudfront get-distribution --id <distribution-id> | grep -i status
   ```

3. **Check S3 Bucket Has Files**
   ```bash
   aws s3 ls s3://<bucket-name> --recursive
   ```

### Slow Performance

1. Verify CloudFront caching is configured correctly
2. Check cache hit ratio in CloudFront metrics
3. Review cache behavior settings in main.tf

### SSL Certificate Errors

1. Ensure Route 53 hosted zone exists
2. Check DNS validation records created:
   ```bash
   aws route53 list-resource-record-sets --hosted-zone-id <zone-id>
   ```

3. Wait for validation to complete (5-15 minutes)

### Deployment Script Fails

Verify AWS credentials:
```bash
aws sts get-caller-identity

# If not configured
aws configure
```

## Rollback

To revert to a previous version:

### S3 Versioning

S3 versioning is enabled. To restore a previous version:

```bash
# List versions
aws s3api list-object-versions --bucket <bucket-name>

# Restore specific version
aws s3api get-object --bucket <bucket-name> --key index.html --version-id <version-id> dist/index.html
```

### Complete Rollback

If needed, you can revert to a previous Terraform state:

```bash
# List available backups
ls -la terraform/terraform.tfstate*

# Restore from backup
cp terraform/terraform.tfstate.backup terraform/terraform.tfstate
terraform apply
```

## Updating Infrastructure

To modify infrastructure:

```bash
# Update terraform.tfvars
vim terraform/terraform.tfvars

# Review changes
terraform plan

# Apply
terraform apply
```

## Cost Optimization

1. **Enable CloudFront compression**
   - Already enabled by default
   - Reduces bandwidth costs

2. **Optimize cache settings**
   - Adjust cache_ttl_max for static assets
   - Use proper Cache-Control headers

3. **Monitor usage**
   ```bash
   # Check CloudFront usage
   aws cloudwatch get-metric-statistics \
     --namespace AWS/CloudFront \
     --metric-name BytesDownloaded \
     --dimensions Name=DistributionId,Value=<dist-id> \
     --start-time <date> --end-time <date> \
     --period 86400 --statistics Sum
   ```

4. **Use appropriate price class**
   - Current: PriceClass_100 (all edge locations)
   - Options: PriceClass_100, PriceClass_200, PriceClass_All

## Additional Resources

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [AWS CloudFront Guide](https://docs.aws.amazon.com/cloudfront/)
- [AWS Route 53 Guide](https://docs.aws.amazon.com/route53/)
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

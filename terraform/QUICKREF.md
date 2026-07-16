# Quick Reference

## Common Commands

### Terraform Management

```bash
# Initialize Terraform
cd terraform
terraform init

# Validate configuration
terraform validate

# Format code
terraform fmt -recursive

# Plan infrastructure changes
terraform plan

# Apply changes
terraform apply

# Destroy infrastructure
terraform destroy

# Refresh state
terraform refresh

# Show current state
terraform show
```

### Outputs & Information

```bash
# Get all outputs
terraform output

# Get specific output (raw text)
terraform output -raw s3_bucket_name
terraform output -raw cloudfront_distribution_id
terraform output -raw website_domain

# Export outputs to JSON
terraform output -json > outputs.json
```

### State Management

```bash
# Show resources in state
terraform state list

# Show resource details
terraform state show aws_s3_bucket.site

# Backup state
cp terraform/terraform.tfstate terraform/terraform.tfstate.backup

# Pull remote state (if using remote backend)
terraform state pull
```

## Deployment Commands

### Build Site

```bash
# Build for production
npm run build

# Preview build
npm run preview
```

### Deploy to S3

```bash
# Get bucket name
BUCKET_NAME=$(cd terraform && terraform output -raw s3_bucket_name)

# Full sync (delete old files)
aws s3 sync dist/ s3://$BUCKET_NAME --delete

# Sync without delete
aws s3 sync dist/ s3://$BUCKET_NAME

# Upload single file
aws s3 cp dist/index.html s3://$BUCKET_NAME/index.html --cache-control "max-age=0"

# List uploaded files
aws s3 ls s3://$BUCKET_NAME --recursive
```

### CloudFront Management

```bash
# Get distribution ID
DIST_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)

# Invalidate entire cache
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths '/*'

# Invalidate specific paths
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths '/index.html' '/api/*'

# List invalidations
aws cloudfront list-invalidations --distribution-id $DIST_ID

# Get distribution status
aws cloudfront get-distribution --id $DIST_ID

# Describe distribution
aws cloudfront describe-distribution --id $DIST_ID
```

### DNS & Verification

```bash
# Get website domain
DOMAIN=$(cd terraform && terraform output -raw website_domain)

# Check DNS resolution
nslookup $DOMAIN
dig $DOMAIN
dig $DOMAIN +short

# Verify HTTPS
curl -vI https://$DOMAIN

# Check certificate
echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 -showcerts 2>/dev/null | openssl x509 -noout -dates
```

### Monitoring

```bash
# Check S3 bucket size
aws s3 ls s3://$BUCKET_NAME --summarize --human-readable --recursive

# View CloudFront metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=$DIST_ID \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum

# List S3 object versions
aws s3api list-object-versions --bucket $BUCKET_NAME
```

## AWS CLI Setup

```bash
# Configure AWS credentials
aws configure

# Verify credentials
aws sts get-caller-identity

# List AWS regions
aws ec2 describe-regions --query 'Regions[].RegionName' --output text

# Set default region
export AWS_REGION=us-east-1
export AWS_DEFAULT_REGION=us-east-1
```

## Environment Variables

```bash
# AWS credentials
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
export AWS_REGION=us-east-1

# Terraform
export TF_VAR_domain_name=example.com
export TF_VAR_subdomain=www
export TF_LOG=DEBUG
export TF_LOG_PATH=terraform.log
```

## Useful Aliases

Add to `.bashrc` or `.zshrc`:

```bash
# Terraform shortcuts
alias tf='terraform'
alias tfinit='terraform init'
alias tfplan='terraform plan'
alias tfapply='terraform apply'
alias tfoutput='terraform output'
alias tfdestroy='terraform destroy'

# AWS shortcuts
alias s3ls='aws s3 ls'
alias s3sync='aws s3 sync'
alias cflist='aws cloudfront list-distributions'
alias r53zones='aws route53 list-hosted-zones'

# Deployment
alias deploy='npm run build && node scripts/deploy-s3.mjs'
```

## Quick Deploy Script

Save as `quick-deploy.sh`:

```bash
#!/bin/bash
set -e

echo "Building..."
npm run build

echo "Deploying..."
BUCKET=$(cd terraform && terraform output -raw s3_bucket_name)
DIST=$(cd terraform && terraform output -raw cloudfront_distribution_id)

aws s3 sync dist/ s3://$BUCKET --delete
aws cloudfront create-invalidation --distribution-id $DIST --paths '/*'

echo "✅ Done! https://$(cd terraform && terraform output -raw website_domain)"
```

Make executable:
```bash
chmod +x quick-deploy.sh
./quick-deploy.sh
```

## Debugging

```bash
# Enable Terraform debug logging
export TF_LOG=DEBUG
export TF_LOG_PATH=terraform.log
terraform plan

# Check AWS CLI debug output
aws s3 ls --debug

# Validate S3 bucket policy
aws s3api get-bucket-policy --bucket $BUCKET_NAME | jq .

# Test CloudFront access
curl -I https://$(cd terraform && terraform output -raw cloudfront_distribution_domain)

# SSH debugging (if needed)
ssh -i key.pem ec2-user@instance-id
```

## File Locations

```bash
# Terraform files
terraform/
├── main.tf          # Core resources
├── s3.tf            # S3 buckets
├── provider.tf      # AWS provider
├── variables.tf     # Input variables
├── outputs.tf       # Outputs
└── terraform.tfvars # Local variables (git-ignored)

# Build output
dist/
├── index.html
├── assets/
└── ...

# Logs
terraform.log       # Terraform debug log
.terraform/         # Terraform cache directory
```

## Common Issues & Solutions

### "Bucket already exists"
- Bucket names must be globally unique
- Use custom `bucket_name` in terraform.tfvars

### "Certificate validation failed"
- Wait 5-15 minutes for DNS propagation
- Verify hosted zone is correct:
  ```bash
  aws route53 list-hosted-zones
  ```

### "Access Denied" on S3
- Check bucket policy includes CloudFront OAI
- Verify IAM permissions
  ```bash
  aws iam get-user-policy --user-name your-user --policy-name policy-name
  ```

### CloudFront returns 403
- Ensure S3 bucket is not public
- Verify OAI is configured
- Check Origin Access Identity in distribution

## Performance Tips

```bash
# Enable gzip compression in CloudFront
# Already enabled in terraform configuration

# Check cache hit ratio
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name CacheHitRate \
  --dimensions Name=DistributionId,Value=$DIST_ID \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Average

# Review cache behaviors in main.tf
# Adjust TTL values for optimal caching
```

## Useful Resources

- [Terraform Docs](https://www.terraform.io/docs)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/latest/)
- [CloudFront Best Practices](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/BestPractices.html)
- [S3 Static Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

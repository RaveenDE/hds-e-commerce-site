# Terraform Configuration: Static Web Hosting with CloudFront and Route 53

This Terraform configuration sets up a production-ready static website hosting infrastructure on AWS with:

- **S3 Buckets**: Secure storage with versioning and encryption
- **CloudFront**: Global CDN with caching optimization
- **Route 53**: DNS management and health checks
- **ACM Certificate**: Free SSL/TLS certificate
- **Origin Access Identity (OAI)**: Secure S3 access from CloudFront

## Prerequisites

1. **AWS Account**: Active account with appropriate permissions
2. **Terraform**: Version 1.0 or higher installed ([Install Terraform](https://www.terraform.io/downloads.html))
3. **AWS CLI**: Configured with credentials (`aws configure`)
4. **Domain**: Registered domain with Route 53 hosted zone or ability to create one

## File Structure

```
terraform/
├── provider.tf              # AWS provider configuration
├── variables.tf             # Input variables
├── main.tf                  # Core resources (CloudFront, Route 53, ACM)
├── s3.tf                    # S3 bucket configurations
├── outputs.tf               # Output values
├── terraform.tfvars.example # Example variables file
└── README.md               # This file
```

## Setup Instructions

### Step 1: Clone or Copy Configuration

```bash
# The terraform directory is in the project root
cd terraform
```

### Step 2: Create Terraform Variables File

```bash
# Copy the example file
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
# Required variables:
# - domain_name: Your domain (e.g., example.com)
# - subdomain: Subdomain for the site (e.g., www)
```

### Step 3: Initialize Terraform

```bash
terraform init
```

This downloads required providers and initializes the Terraform working directory.

### Step 4: Review Plan

```bash
terraform plan
```

Review the resources that will be created.

### Step 5: Apply Configuration

```bash
terraform apply
```

Confirm the prompt by typing `yes`. This will:
1. Create S3 buckets with proper security settings
2. Create an ACM certificate
3. Create CloudFront distributions
4. Configure Route 53 DNS records
5. Set up Origin Access Identity

**Note**: SSL certificate validation may take 5-15 minutes via DNS verification.

## Configuration Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `domain_name` | Your domain | `example.com` |
| `subdomain` | Subdomain for the site | `www` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `aws_region` | AWS region | `us-east-1` |
| `bucket_name` | Custom S3 bucket name | `{domain_name}-site` |
| `enable_compression` | Enable CloudFront compression | `true` |
| `cache_ttl_default` | Default cache TTL (seconds) | `3600` |
| `cache_ttl_max` | Max cache TTL (seconds) | `86400` |
| `enable_subdomain_redirect` | Redirect apex domain to www | `false` |

## Deployment

### Upload Site Content to S3

After Terraform completes successfully:

```bash
# Build your site (Vite)
npm run build

# Get the S3 bucket name from Terraform outputs
S3_BUCKET=$(terraform output -raw s3_bucket_name)

# Sync built files to S3
aws s3 sync dist/ s3://$S3_BUCKET --delete

# Invalidate CloudFront cache
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths '/*'
```

### Or Use the Provided Script

The project includes a deployment script:

```bash
# From project root
BUCKET_NAME=$(cd terraform && terraform output -raw s3_bucket_name)
node scripts/deploy-s3.mjs
```

## Caching Strategy

The CloudFront distribution includes optimized cache behaviors:

| Path Pattern | TTL | Purpose |
|--------------|-----|---------|
| `index.html` | 0 (no cache) | Always fetch latest |
| `*.{js,css,images,etc}` | 31536000 (1 year) | Long-lived for cache busting |
| Default | 1 hour | Standard files |

## Outputs

After `terraform apply`, useful information is displayed:

```
s3_bucket_name = "example-com-site"
cloudfront_distribution_domain = "d123456.cloudfront.net"
website_domain = "www.example.com"
deployment_commands = {...}
```

Get outputs anytime with:

```bash
terraform output
terraform output -raw s3_bucket_name
```

## Cost Estimation

Typical monthly costs:

- **S3 Storage**: ~$1-5 (depending on usage)
- **CloudFront**: ~$0.085 per GB (varies by region)
- **Route 53**: $0.50/zone + $0.40 per million queries
- **ACM Certificate**: FREE

Use AWS Pricing Calculator for detailed estimates.

## Monitoring and Maintenance

### View CloudFront Metrics

```bash
aws cloudfront get-distribution --id $(terraform output -raw cloudfront_distribution_id)
```

### Invalidate Cache

When updating content:

```bash
DISTRIBUTION_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths '/*'
```

### Update Terraform

To modify infrastructure:

```bash
# Edit terraform.tfvars or variable defaults
terraform plan    # Review changes
terraform apply   # Apply changes
```

## Destroying Infrastructure

To remove all resources:

```bash
# This WILL delete your S3 buckets and CloudFront distributions
terraform destroy
```

**Warning**: S3 buckets with versioning enabled will have all versions deleted.

## Troubleshooting

### Certificate Validation Fails

Ensure Route 53 hosted zone is properly configured:

```bash
# Check DNS records
aws route53 list-resource-record-sets --hosted-zone-id /hostedzone/YOUR_ZONE_ID
```

### S3 Access Denied

Verify S3 bucket policy and OAI are correctly configured:

```bash
aws s3api get-bucket-policy --bucket $(terraform output -raw s3_bucket_name)
```

### CloudFront Returns 403

- Ensure S3 bucket policy includes CloudFront OAI
- Check CloudFront distribution error logs in AWS Console

### DNS Not Resolving

- Wait 5-10 minutes for DNS propagation
- Verify DNS records created in Route 53:

```bash
aws route53 list-resource-record-sets --hosted-zone-id /hostedzone/YOUR_ZONE_ID | grep -A5 "www.example.com"
```

## Advanced Configurations

### Custom Domain

Edit `terraform.tfvars`:

```hcl
domain_name = "yourdomain.com"
subdomain   = "www"
```

### Subdomain Redirects

To redirect apex domain to www:

```hcl
enable_subdomain_redirect = true
```

### WAF Protection

Add this to `main.tf` for additional security:

```hcl
# Create AWS WAF rules (additional cost)
resource "aws_wafv2_web_acl" "site" {
  # ... configuration
}
```

### Logging

Add S3 access and CloudFront logs:

```hcl
logging {
  include_cookies = false
  bucket          = aws_s3_bucket.logs.bucket_regional_domain_name
}
```

## Security Best Practices

✅ Implemented:
- All traffic HTTPS only
- S3 buckets blocked from public access
- Versioning enabled on S3
- Server-side encryption on S3
- Origin Access Identity for secure S3 access
- CloudFront minimum TLS 1.2

## Support and Resources

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS Route 53 Documentation](https://docs.aws.amazon.com/route53/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)

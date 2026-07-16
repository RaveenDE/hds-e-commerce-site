.PHONY: help init plan apply destroy validate fmt output clean build deploy deploy-all invalidate status check

help:
	@echo "HDS Site Terraform & Deployment"
	@echo ""
	@echo "Terraform commands:"
	@echo "  make init          Initialize Terraform"
	@echo "  make plan          Plan infrastructure changes"
	@echo "  make apply         Apply infrastructure changes"
	@echo "  make destroy       Destroy all infrastructure (WARNING)"
	@echo "  make validate      Validate Terraform configuration"
	@echo "  make fmt           Format Terraform files"
	@echo "  make output        Display Terraform outputs"
	@echo ""
	@echo "Build & Deploy commands:"
	@echo "  make build         Build site for production"
	@echo "  make deploy        Deploy to S3"
	@echo "  make deploy-all    Build and deploy to S3"
	@echo "  make invalidate    Invalidate CloudFront cache"
	@echo ""
	@echo "Utilities:"
	@echo "  make status        Check deployment status"
	@echo "  make check         Check prerequisites"
	@echo "  make clean         Clean build artifacts and cache"
	@echo ""

# Prerequisites
check:
	@echo "Checking prerequisites..."
	@command -v terraform >/dev/null 2>&1 || { echo "❌ Terraform not installed"; exit 1; }
	@command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI not installed"; exit 1; }
	@command -v node >/dev/null 2>&1 || { echo "❌ Node.js not installed"; exit 1; }
	@terraform -v | head -1
	@aws --version
	@node --version
	@aws sts get-caller-identity >/dev/null 2>&1 || { echo "❌ AWS credentials not configured"; exit 1; }
	@echo "✅ All prerequisites met"

# Terraform initialization
init: check
	@echo "Initializing Terraform..."
	@cd terraform && terraform init

validate:
	@echo "Validating Terraform configuration..."
	@cd terraform && terraform validate

fmt:
	@echo "Formatting Terraform files..."
	@cd terraform && terraform fmt -recursive

# Terraform planning and applying
plan: check
	@echo "Planning infrastructure changes..."
	@cd terraform && terraform plan

apply: check
	@echo "Applying infrastructure changes..."
	@cd terraform && terraform apply

destroy: check
	@echo "⚠️  WARNING: This will destroy all infrastructure!"
	@read -p "Type 'yes' to confirm: " confirm && [ "$$confirm" = "yes" ] && cd terraform && terraform destroy || echo "Cancelled"

# Build commands
build: check
	@echo "Building site for production..."
	@npm run build
	@echo "✅ Build complete"

# Deployment commands
deploy: check
	@echo "Deploying to S3..."
	@BUCKET_NAME=$$(cd terraform && terraform output -raw s3_bucket_name 2>/dev/null) && \
	aws s3 sync dist/ s3://$$BUCKET_NAME --delete --quiet && \
	echo "✅ Files uploaded to S3"

deploy-all: check build deploy invalidate
	@echo "✅ Full deployment complete"

# CloudFront invalidation
invalidate: check
	@echo "Invalidating CloudFront cache..."
	@DIST_ID=$$(cd terraform && terraform output -raw cloudfront_distribution_id 2>/dev/null) && \
	aws cloudfront create-invalidation --distribution-id $$DIST_ID --paths '/*' >/dev/null && \
	echo "✅ CloudFront cache invalidated"

# Output commands
output: check
	@echo "Terraform outputs:"
	@cd terraform && terraform output

# Status commands
status: check
	@echo "Deployment Status:"
	@echo ""
	@echo "📦 S3 Bucket:"
	@BUCKET_NAME=$$(cd terraform && terraform output -raw s3_bucket_name 2>/dev/null) && \
	aws s3 ls s3://$$BUCKET_NAME --recursive --summarize | tail -3 || echo "⚠️  No S3 bucket found"
	@echo ""
	@echo "🌍 CloudFront:"
	@DIST_ID=$$(cd terraform && terraform output -raw cloudfront_distribution_id 2>/dev/null) && \
	aws cloudfront get-distribution --id $$DIST_ID --query 'Distribution.DistributionConfig.Enabled' 2>/dev/null && echo "Status: ✅ Enabled" || echo "⚠️  No distribution found"
	@echo ""
	@echo "🔗 Domain:"
	@DOMAIN=$$(cd terraform && terraform output -raw website_domain 2>/dev/null) && \
	echo "  $$DOMAIN" || echo "⚠️  No domain configured"
	@echo ""
	@echo "🔐 Certificate:"
	@DOMAIN=$$(cd terraform && terraform output -raw website_domain 2>/dev/null) && \
	echo | openssl s_client -servername $$DOMAIN -connect $$DOMAIN:443 -showcerts 2>/dev/null | openssl x509 -noout -dates | head -1 || echo "⚠️  No certificate found"

# Cleanup commands
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf dist/
	@rm -rf .terraform/
	@rm -f terraform/terraform.tfstate*
	@rm -f terraform.log
	@echo "✅ Cleanup complete"

# Combined workflows
.DEFAULT_GOAL := help

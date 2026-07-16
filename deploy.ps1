# Deployment script for HDS Site to S3 and CloudFront
# Usage: ./deploy.ps1 [build|deploy|invalidate|status|all]

param(
    [Parameter(Position = 0)]
    [string]$Command = "help"
)

$ErrorActionPreference = "Stop"

function Show-Help {
    @"
HDS Site Deployment Script

Usage: ./deploy.ps1 [command]

Commands:
  help       - Show this help message
  check      - Check prerequisites
  build      - Build site for production
  deploy     - Deploy to S3
  invalidate - Invalidate CloudFront cache
  status     - Show deployment status
  all        - Build, deploy, and invalidate
  clean      - Clean build artifacts
"@
}

function Check-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Cyan
    Write-Host ""

    # Check Terraform
    if (Get-Command terraform -ErrorAction SilentlyContinue) {
        Write-Host "[OK] Terraform installed" -ForegroundColor Green
        $version = terraform -version | Select-Object -First 1
        Write-Host "     $version" -ForegroundColor Gray
    }
    else {
        Write-Host "[X] Terraform not found in PATH" -ForegroundColor Red
        return $false
    }

    # Check AWS CLI
    if (Get-Command aws -ErrorAction SilentlyContinue) {
        Write-Host "[OK] AWS CLI installed" -ForegroundColor Green
        $version = aws --version | Split-String | Select-Object -First 1
        Write-Host "     aws-cli $version" -ForegroundColor Gray
    }
    else {
        Write-Host "[X] AWS CLI not found in PATH" -ForegroundColor Red
        return $false
    }

    # Check Node.js
    if (Get-Command node -ErrorAction SilentlyContinue) {
        Write-Host "[OK] Node.js installed" -ForegroundColor Green
        $version = node --version
        Write-Host "     $version" -ForegroundColor Gray
    }
    else {
        Write-Host "[X] Node.js not found in PATH" -ForegroundColor Red
        return $false
    }

    # Check AWS credentials
    try {
        $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
        Write-Host "[OK] AWS credentials configured" -ForegroundColor Green
        Write-Host "     Account: $($identity.Account)" -ForegroundColor Gray
    }
    catch {
        Write-Host "[X] AWS credentials not configured" -ForegroundColor Red
        return $false
    }

    Write-Host ""
    Write-Host "[OK] All prerequisites met" -ForegroundColor Green
    return $true
}

function Build-Site {
    Write-Host "Building site for production..." -ForegroundColor Cyan
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Build failed" -ForegroundColor Red
        return $false
    }

    Write-Host ""
    Write-Host "[OK] Build complete" -ForegroundColor Green
    return $true
}

function Deploy-ToS3 {
    Write-Host "Deploying to S3..." -ForegroundColor Cyan

    # Get bucket name from Terraform
    Push-Location terraform
    try {
        $bucketName = terraform output -raw s3_bucket_name 2>$null
        if (-not $bucketName) {
            Write-Host "[ERROR] Could not get S3 bucket name from Terraform" -ForegroundColor Red
            Write-Host "Make sure you have run 'terraform apply' first" -ForegroundColor Yellow
            return $false
        }
    }
    finally {
        Pop-Location
    }

    Write-Host "Syncing files to S3 bucket: $bucketName"
    aws s3 sync dist/ s3://$bucketName --delete
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] S3 sync failed" -ForegroundColor Red
        return $false
    }

    Write-Host ""
    Write-Host "[OK] Files uploaded to S3" -ForegroundColor Green
    return $true
}

function Invalidate-CloudFront {
    Write-Host "Invalidating CloudFront cache..." -ForegroundColor Cyan

    # Get distribution ID from Terraform
    Push-Location terraform
    try {
        $distId = terraform output -raw cloudfront_distribution_id 2>$null
        if (-not $distId) {
            Write-Host "[ERROR] Could not get CloudFront distribution ID from Terraform" -ForegroundColor Red
            Write-Host "Make sure you have run 'terraform apply' first" -ForegroundColor Yellow
            return $false
        }
    }
    finally {
        Pop-Location
    }

    Write-Host "Creating invalidation for distribution: $distId"
    aws cloudfront create-invalidation --distribution-id $distId --paths '/*' | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] CloudFront invalidation failed" -ForegroundColor Red
        return $false
    }

    Write-Host ""
    Write-Host "[OK] CloudFront cache invalidated" -ForegroundColor Green
    return $true
}

function Show-Status {
    Write-Host ""
    Write-Host "Deployment Status:" -ForegroundColor Cyan
    Write-Host ""

    # Get bucket name
    Push-Location terraform
    try {
        $bucketName = terraform output -raw s3_bucket_name 2>$null
        $distId = terraform output -raw cloudfront_distribution_id 2>$null
        $domain = terraform output -raw website_domain 2>$null
    }
    finally {
        Pop-Location
    }

    # S3 Bucket status
    Write-Host "S3 Bucket:" -ForegroundColor White
    if (-not $bucketName) {
        Write-Host "  [X] No bucket configured" -ForegroundColor Red
    }
    else {
        Write-Host "  [OK] Bucket: $bucketName" -ForegroundColor Green
        try {
            $summary = aws s3 ls s3://$bucketName --recursive --summarize 2>$null | Select-String "Total Objects"
            if ($summary) {
                Write-Host "  $summary" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "  Warning: Could not fetch bucket contents" -ForegroundColor Yellow
        }
    }

    # CloudFront status
    Write-Host ""
    Write-Host "CloudFront Distribution:" -ForegroundColor White
    if (-not $distId) {
        Write-Host "  [X] No distribution configured" -ForegroundColor Red
    }
    else {
        Write-Host "  [OK] Distribution: $distId" -ForegroundColor Green
        try {
            $config = aws cloudfront get-distribution --id $distId --query "Distribution.DistributionConfig.Enabled" 2>$null
            if ($config) {
                Write-Host "  Status: $config" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "  Warning: Could not fetch distribution status" -ForegroundColor Yellow
        }
    }

    # Website domain
    Write-Host ""
    Write-Host "Website:" -ForegroundColor White
    if (-not $domain) {
        Write-Host "  [X] No domain configured" -ForegroundColor Red
    }
    else {
        Write-Host "  [OK] Domain: https://$domain" -ForegroundColor Green
    }

    Write-Host ""
}

function Clean-Artifacts {
    Write-Host "Cleaning build artifacts and cache..." -ForegroundColor Cyan
    Write-Host ""

    if (Test-Path "dist") {
        Write-Host "Removing dist directory..."
        Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
    }

    if (Test-Path ".terraform") {
        Write-Host "Removing .terraform directory..."
        Remove-Item -Path ".terraform" -Recurse -Force -ErrorAction SilentlyContinue
    }

    if (Test-Path "terraform\terraform.tfstate*") {
        Write-Host "Removing Terraform state files..."
        Remove-Item -Path "terraform\terraform.tfstate*" -Force -ErrorAction SilentlyContinue
    }

    if (Test-Path "terraform.log") {
        Remove-Item -Path "terraform.log" -Force -ErrorAction SilentlyContinue
    }

    Write-Host "[OK] Cleanup complete" -ForegroundColor Green
}

# Main script logic
try {
    switch ($Command.ToLower()) {
        "help" { Show-Help }
        "check" { Check-Prerequisites | Out-Null }
        "build" { Build-Site | Out-Null }
        "deploy" { Deploy-ToS3 | Out-Null }
        "invalidate" { Invalidate-CloudFront | Out-Null }
        "status" { Show-Status }
        "all" {
            Write-Host "Running full deployment..." -ForegroundColor Cyan
            Write-Host ""
            
            Build-Site | Out-Null
            Write-Host ""
            
            Deploy-ToS3 | Out-Null
            Write-Host ""
            
            Invalidate-CloudFront | Out-Null
            
            Write-Host ""
            Write-Host "[OK] Full deployment complete!" -ForegroundColor Green
            
            # Show domain
            Push-Location terraform
            try {
                $domain = terraform output -raw website_domain 2>$null
                if ($domain) {
                    Write-Host ""
                    Write-Host "Visit: https://$domain" -ForegroundColor Green
                }
            }
            finally {
                Pop-Location
            }
        }
        "clean" { Clean-Artifacts }
        default {
            Write-Host "Unknown command: $Command" -ForegroundColor Red
            Write-Host ""
            Show-Help
            exit 1
        }
    }
}
catch {
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

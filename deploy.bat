@echo off
REM Deployment script for HDS Site to S3 and CloudFront
REM Usage: deploy.bat [build|deploy|invalidate|status|all]

setlocal enabledelayedexpansion

if "%1"=="" (
    call :show_help
    exit /b 0
)

cd /d %~dp0

if /i "%1"=="help" goto :show_help
if /i "%1"=="check" goto :check
if /i "%1"=="build" goto :build
if /i "%1"=="deploy" goto :deploy
if /i "%1"=="invalidate" goto :invalidate
if /i "%1"=="status" goto :status
if /i "%1"=="all" goto :all
if /i "%1"=="clean" goto :clean

echo Unknown command: %1
call :show_help
exit /b 1

:show_help
echo.
echo HDS Site Deployment Script
echo.
echo Usage: deploy.bat [command]
echo.
echo Commands:
echo   help       - Show this help message
echo   check      - Check prerequisites
echo   build      - Build site for production
echo   deploy     - Deploy to S3
echo   invalidate - Invalidate CloudFront cache
echo   status     - Show deployment status
echo   all        - Build, deploy, and invalidate
echo   clean      - Clean build artifacts
echo.
exit /b 0

:check
echo Checking prerequisites...
echo.

where terraform >nul 2>&1
if errorlevel 1 (
    echo [X] Terraform not found in PATH
    exit /b 1
) else (
    echo [OK] Terraform installed
    terraform -v | findstr /R "Terraform v" | head -1
)

where aws >nul 2>&1
if errorlevel 1 (
    echo [X] AWS CLI not found in PATH
    exit /b 1
) else (
    echo [OK] AWS CLI installed
    aws --version | findstr /R "aws-cli"
)

where node >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js not found in PATH
    exit /b 1
) else (
    echo [OK] Node.js installed
    node --version
)

aws sts get-caller-identity >nul 2>&1
if errorlevel 1 (
    echo [X] AWS credentials not configured
    exit /b 1
) else (
    echo [OK] AWS credentials configured
)

echo.
echo [OK] All prerequisites met
exit /b 0

:build
echo Building site for production...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed
    exit /b 1
)
echo.
echo [OK] Build complete
exit /b 0

:deploy
echo Deploying to S3...

REM Get bucket name from Terraform
cd terraform
for /f "tokens=*" %%i in ('terraform output -raw s3_bucket_name 2>nul') do set "BUCKET_NAME=%%i"
cd ..

if "!BUCKET_NAME!"=="" (
    echo [ERROR] Could not get S3 bucket name from Terraform
    echo Make sure you have run 'terraform apply' first
    exit /b 1
)

echo Syncing files to S3 bucket: !BUCKET_NAME!
aws s3 sync dist\ s3://!BUCKET_NAME! --delete
if errorlevel 1 (
    echo [ERROR] S3 sync failed
    exit /b 1
)

echo.
echo [OK] Files uploaded to S3
exit /b 0

:invalidate
echo Invalidating CloudFront cache...

REM Get distribution ID from Terraform
cd terraform
for /f "tokens=*" %%i in ('terraform output -raw cloudfront_distribution_id 2>nul') do set "DIST_ID=%%i"
cd ..

if "!DIST_ID!"=="" (
    echo [ERROR] Could not get CloudFront distribution ID from Terraform
    echo Make sure you have run 'terraform apply' first
    exit /b 1
)

echo Creating invalidation for distribution: !DIST_ID!
aws cloudfront create-invalidation --distribution-id !DIST_ID! --paths "/*"
if errorlevel 1 (
    echo [ERROR] CloudFront invalidation failed
    exit /b 1
)

echo.
echo [OK] CloudFront cache invalidated
exit /b 0

:status
echo.
echo Deployment Status:
echo.

REM Get bucket name
cd terraform
for /f "tokens=*" %%i in ('terraform output -raw s3_bucket_name 2>nul') do set "BUCKET_NAME=%%i"
for /f "tokens=*" %%i in ('terraform output -raw cloudfront_distribution_id 2>nul') do set "DIST_ID=%%i"
for /f "tokens=*" %%i in ('terraform output -raw website_domain 2>nul') do set "DOMAIN=%%i"
cd ..

echo S3 Bucket:
if "!BUCKET_NAME!"=="" (
    echo   [X] No bucket configured
) else (
    echo   [OK] Bucket: !BUCKET_NAME!
    for /f "tokens=2" %%i in ('aws s3 ls s3://!BUCKET_NAME! --recursive --summarize 2>nul ^| findstr /R "Total Objects"') do (
        echo   Files: %%i
    )
)

echo.
echo CloudFront Distribution:
if "!DIST_ID!"=="" (
    echo   [X] No distribution configured
) else (
    echo   [OK] Distribution: !DIST_ID!
    for /f "tokens=*" %%i in ('aws cloudfront get-distribution --id !DIST_ID! --query "Distribution.DistributionConfig.Enabled" 2>nul') do (
        echo   Status: %%i
    )
)

echo.
echo Website:
if "!DOMAIN!"=="" (
    echo   [X] No domain configured
) else (
    echo   [OK] Domain: https://!DOMAIN!
)

echo.
exit /b 0

:all
echo Running full deployment...
echo.

call :build
if errorlevel 1 exit /b 1

echo.
call :deploy
if errorlevel 1 exit /b 1

echo.
call :invalidate
if errorlevel 1 exit /b 1

echo.
echo [OK] Full deployment complete!

REM Get domain for display
cd terraform
for /f "tokens=*" %%i in ('terraform output -raw website_domain 2>nul') do set "DOMAIN=%%i"
cd ..

if not "!DOMAIN!"=="" (
    echo.
    echo Visit: https://!DOMAIN!
)

exit /b 0

:clean
echo Cleaning build artifacts and cache...
echo.

if exist "dist" (
    echo Removing dist directory...
    rmdir /s /q dist
)

if exist ".terraform" (
    echo Removing .terraform directory...
    rmdir /s /q .terraform
)

if exist "terraform\terraform.tfstate" (
    echo Removing Terraform state files...
    del /q terraform\terraform.tfstate*
)

if exist "terraform.log" (
    del /q terraform.log
)

echo [OK] Cleanup complete
exit /b 0

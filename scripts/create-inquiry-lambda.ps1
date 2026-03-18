# Create the inquiry Lambda function from backend/lambda/inquiryHandler.mjs
# Prerequisites: AWS CLI installed and configured (aws configure).
#
# Usage (PowerShell):
#   $env:REGION = "us-east-1"
#   .\scripts\create-inquiry-lambda.ps1
#
# Then set Lambda env vars in AWS Console: INQUIRY_TO_EMAIL, INQUIRY_FROM_EMAIL, FRONTEND_ORIGIN
# And attach SES policy to the role if you want email (see docs).

$ErrorActionPreference = "Stop"
$REGION = if ($env:REGION) { $env:REGION } else { "us-east-1" }
$LAMBDA_NAME = "hds-inquiry-lambda"
$ROLE_NAME = "hds-inquiry-lambda-role"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$LambdaDir = Join-Path $RepoRoot "backend\lambda"
$ZipPath = Join-Path $LambdaDir "lambda.zip"

Write-Host "Creating Lambda function '$LAMBDA_NAME' in $REGION..."

# Zip the handler (must be at root of zip)
$handlerPath = Join-Path $LambdaDir "inquiryHandler.mjs"
if (-not (Test-Path $handlerPath)) {
  Write-Error "Handler not found: $handlerPath"
}
Remove-Item -Path $ZipPath -Force -ErrorAction SilentlyContinue
Compress-Archive -Path $handlerPath -DestinationPath $ZipPath -Force

# Create IAM role for Lambda if it doesn't exist
$roleArn = aws iam get-role --role-name $ROLE_NAME --query "Role.Arn" --output text 2>$null
if (-not $roleArn) {
  Write-Host "Creating IAM role '$ROLE_NAME'..."
  $trustPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
"@
  aws iam create-role `
    --role-name $ROLE_NAME `
    --assume-role-policy-document $trustPolicy `
    --description "Execution role for HDS inquiry Lambda" | Out-Null
  aws iam attach-role-policy `
    --role-name $ROLE_NAME `
    --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" | Out-Null
  Write-Host "Waiting for role to be usable..."
  Start-Sleep -Seconds 10
  $roleArn = (aws iam get-role --role-name $ROLE_NAME --query "Role.Arn" --output text).Trim()
}

# Create or update Lambda
$exists = aws lambda get-function --function-name $LAMBDA_NAME --region $REGION 2>$null
if ($exists) {
  Write-Host "Updating existing function code..."
  aws lambda update-function-code `
    --function-name $LAMBDA_NAME `
    --zip-file "fileb://$($ZipPath -replace '\\','/')" `
    --region $REGION | Out-Null
} else {
  Write-Host "Creating new function..."
  aws lambda create-function `
    --function-name $LAMBDA_NAME `
    --runtime nodejs18.x `
    --role $roleArn `
    --handler "inquiryHandler.handler" `
    --zip-file "fileb://$($ZipPath -replace '\\','/')" `
    --region $REGION `
    --timeout 10 `
    --memory-size 128 | Out-Null
}

Remove-Item -Path $ZipPath -Force -ErrorAction SilentlyContinue
Write-Host "Done. Lambda '$LAMBDA_NAME' is ready."
Write-Host "Next: run .\scripts\create-inquiry-api.ps1 to create API Gateway, then set Lambda env vars (INQUIRY_TO_EMAIL, etc.) in the AWS Console."
Write-Host ""

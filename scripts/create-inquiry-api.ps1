# Create API Gateway HTTP API for the inquiry Lambda (quick create).
# Prerequisites: AWS CLI installed and configured (aws configure).
# Set REGION and LAMBDA_NAME before running.
#
# Usage (PowerShell):
#   $env:REGION = "ap-south-1"
#   $env:LAMBDA_NAME = "hds-inquiry-lambda"
#   .\scripts\create-inquiry-api.ps1

$ErrorActionPreference = "Stop"
$REGION = if ($env:REGION) { $env:REGION } else { "us-east-1" }
$LAMBDA_NAME = if ($env:LAMBDA_NAME) { $env:LAMBDA_NAME } else { "hds-inquiry-lambda" }
$API_NAME = "hds-inquiry-api"

# Get account ID (trim in case of newline)
$account = (aws sts get-caller-identity --query Account --output text).Trim()
$lambdaArn = "arn:aws:lambda:${REGION}:${account}:function:${LAMBDA_NAME}"

Write-Host "Creating HTTP API '$API_NAME' with Lambda target '$LAMBDA_NAME' in $REGION..."

# Quick create: API + default catch-all route + default stage
$apiJson = aws apigatewayv2 create-api `
  --name $API_NAME `
  --protocol-type HTTP `
  --target $lambdaArn `
  --region $REGION `
  --output json

$API_ID = ($apiJson | ConvertFrom-Json).ApiId
$ENDPOINT = ($apiJson | ConvertFrom-Json).ApiEndpoint

# Grant API Gateway permission to invoke the Lambda (ignore errors if permission already exists)
$sourceArn = "arn:aws:execute-api:${REGION}:${account}:${API_ID}/*/*/*"
try {
  $null = aws lambda add-permission `
    --function-name $LAMBDA_NAME `
    --statement-id "AllowInvokeFromAPIGW-${API_ID}" `
    --action "lambda:InvokeFunction" `
    --principal apigateway.amazonaws.com `
    --source-arn $sourceArn `
    --region $REGION 2>&1
  if ($LASTEXITCODE -ne 0) { throw "ExitCode $LASTEXITCODE" }
} catch {
  Write-Host "Note: Lambda permission skipped (may already exist if re-running)."
}

# HTTP API quick create uses stage name $default
$STAGE = '$default'
$INVOKE_URL = "${ENDPOINT}/${STAGE}"

Write-Host ""
Write-Host "Done. API ID: $API_ID"
Write-Host "Inquiry endpoint: POST $INVOKE_URL/api/inquiries"
Write-Host ""
Write-Host "Set this in your frontend build (e.g. .env.production):"
Write-Host "  VITE_API_URL=$INVOKE_URL"
Write-Host ""

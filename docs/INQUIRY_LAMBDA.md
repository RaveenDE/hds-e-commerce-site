## Send Inquiry with AWS Lambda (no database)

This guide shows how to make the **Send Inquiry** form work in production when:

- The **frontend** is deployed as a static site (S3 / CloudFront)
- The **inquiry handler** is an **AWS Lambda** function behind **API Gateway**
- You **do not store** inquiries in a database (you can log them or email them)

The existing frontend already calls:

- `POST /api/inquiries` via `hdsApi.submitInquiry(...)`

For production we point that to API Gateway by setting `VITE_API_URL`.

---

### 1. Create the Lambda function first

The handler code is in **`backend/lambda/inquiryHandler.mjs`**. Create the function in AWS (same region you’ll use for API Gateway):

**Option A – PowerShell script (recommended)**

From the project root:

```powershell
$env:REGION = "us-east-1"   # or ap-south-1, etc.
.\scripts\create-inquiry-lambda.ps1
```

The script:

- Zips `inquiryHandler.mjs`
- Creates an IAM role `hds-inquiry-lambda-role` (if it doesn’t exist) with basic Lambda execution
- Creates the Lambda function **`hds-inquiry-lambda`** (or updates its code if it already exists)

**Option B – AWS Console**

1. In Lambda, create a function: Node.js 18+, name e.g. `hds-inquiry-lambda`.
2. Replace the default handler code with the contents of `backend/lambda/inquiryHandler.mjs`.
3. Set **Handler** to `inquiryHandler.handler`.
4. In **Configuration → Environment variables**, add at least **INQUIRY_TO_EMAIL** (and optionally INQUIRY_FROM_EMAIL, FRONTEND_ORIGIN). For email, attach a policy that allows `ses:SendEmail` to the function’s execution role.

After the function exists, run **`.\scripts\create-inquiry-api.ps1`** (same `REGION`) to create the HTTP API and get **VITE_API_URL**.

---

### 2. Create API Gateway + Lambda integration

1. In the AWS Console, create an **HTTP API** (API Gateway).
2. Add a **route**:
   - Method: `POST`
   - Path: `/api/inquiries`
3. Create a **Lambda integration**:
   - Point it to your ` ` Lambda function.
4. Enable **CORS** on the API:
   - Allowed origins: your frontend origin (e.g. `https://www.yourdomain.com` or the S3 / CloudFront URL)
   - Allowed methods: `POST, OPTIONS`
   - Allowed headers: `Content-Type`
5. Deploy the API and note the **Invoke URL**, for example:
   - `https://abc123.execute-api.ap-south-1.amazonaws.com`

Your final inquiry endpoint will be:

- `POST https://abc123.execute-api.ap-south-1.amazonaws.com/api/inquiries`

---

### 3. Configure the frontend to call API Gateway

The frontend uses `VITE_API_URL` to decide where to send API requests.

1. For **production**, set `VITE_API_URL` to your API Gateway base URL, for example:

   ```env
   # .env.production (not committed)
   VITE_API_URL=https://abc123.execute-api.ap-south-1.amazonaws.com
   ```

2. Build the frontend using that env:

   ```bash
   npm run build
   ```

3. Deploy `dist/` to S3 (see `docs/S3_HOSTING.md` for details or use `npm run deploy:s3`).

Now the React app will call:

- `POST https://abc123.execute-api.ap-south-1.amazonaws.com/api/inquiries`

and the Lambda handler will process the request.

---

### 4. Frontend behavior

No code changes are needed in the `Inquiry` page. It already:

- Submits the form to `hdsApi.submitInquiry`
- Shows “Inquiry Sent” on success
- Shows a validation / error message if the API call fails

As long as:

- `VITE_API_URL` points to your API Gateway URL, and
- CORS is configured correctly on API Gateway (and optionally Lambda),

the **Send Inquiry** button will work from the S3-hosted site.

---

### 5. Create API with AWS CLI

You can create the HTTP API and wire it to your Lambda from the command line.

**Option A – PowerShell script (recommended)**

From the project root:

```powershell
$env:REGION = "ap-south-1"
$env:LAMBDA_NAME = "hds-inquiry-lambda"
.\scripts\create-inquiry-api.ps1
```

The script creates the API (quick create with Lambda target), adds invoke permission, and prints the URL to set as `VITE_API_URL`.

**Option B – One-off commands (PowerShell)**

Set variables:

```powershell
$REGION = "ap-south-1"
$LAMBDA_NAME = "hds-inquiry-lambda"
$API_NAME = "hds-inquiry-api"
```

Get account ID and create the API (quick create = default catch-all route + default stage):

```powershell
$account = (aws sts get-caller-identity --query Account --output text).Trim()
$lambdaArn = "arn:aws:lambda:${REGION}:${account}:function:${LAMBDA_NAME}"

$apiJson = aws apigatewayv2 create-api --name $API_NAME --protocol-type HTTP --target $lambdaArn --region $REGION --output json
$API_ID = ($apiJson | ConvertFrom-Json).ApiId
$ENDPOINT = ($apiJson | ConvertFrom-Json).ApiEndpoint
```

Grant API Gateway permission to invoke the Lambda:

```powershell
$sourceArn = "arn:aws:execute-api:${REGION}:${account}:${API_ID}/*/*/*"
aws lambda add-permission --function-name $LAMBDA_NAME --statement-id "AllowInvokeFromAPIGW-$API_ID" --action "lambda:InvokeFunction" --principal apigateway.amazonaws.com --source-arn $sourceArn --region $REGION
```

Your inquiry base URL uses the default stage `$default`:

- **Inquiry endpoint:** `POST $ENDPOINT/$default/api/inquiries`
- **VITE_API_URL:** set to `$ENDPOINT/$default` (e.g. `https://abc123.execute-api.ap-south-1.amazonaws.com/$default`)

---

### 6. Optional: Send emails instead of logging

If you want to receive an email for each inquiry instead of just logging:

1. Configure **Amazon SES** (or another email provider).
2. Update the Lambda handler:
   - After validating the form, call SES to send an email to your address with the inquiry details.
3. Keep the same response shape (`201` with `{ id, message: 'Inquiry received' }`) so the frontend behavior does not change.


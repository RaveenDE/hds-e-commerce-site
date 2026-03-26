## Send Inquiry with AWS Lambda (no database)

This guide shows how to make the **Send Inquiry** form work in production when:

- The **frontend** is deployed as a static site (S3 / CloudFront)
- The **inquiry handler** is an **AWS Lambda** function behind **API Gateway**
- You **do not store** inquiries in a database (you can log them or email them)

The Lambda handler **`inquiryHandler.mjs` only sends email via SES**—it never writes to a database. (If you use the **local Express** `/api/inquiries` route instead, that path saves to **MongoDB** and does not send mail unless you add that yourself.)

The existing frontend already calls:

- `POST /api/inquiries` via `hdsApi.submitInquiry(...)`

For production we point that to API Gateway by setting `VITE_API_URL`.

---

### 1. Create the Lambda function first

The handler code is in **`backend/lambda/inquiryHandler.mjs`**. It uses **`@aws-sdk/client-ses`** (AWS SDK for JavaScript v3), which is **included in the Node.js 18+ Lambda runtime**—do not use the old `aws-sdk` v2 package in a zip-only deploy.

The handler responds to **OPTIONS** (CORS preflight) and only processes **POST** requests whose path contains **`/api/inquiries`**.

Create the function in AWS (same region you’ll use for API Gateway):

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

### 3. Configure the frontend to call API Gateway (Lambda)

`submitInquiry` uses **`VITE_INQUIRY_API_URL`** if set; otherwise **`VITE_API_URL`**. That way the inquiry form can call **API Gateway → Lambda** while other API calls still use your Node backend or the Vite dev proxy.

1. Set the **base URL** (no trailing slash) in `.env` or `.env.production`:

   ```env
   # Stage is literally "$default". Prefer %24 (encoded $) so dotenv-expand does not treat $default as a variable:
   VITE_API_URL=https://abc123.execute-api.ap-south-1.amazonaws.com/%24default
   ```

   Or set **only** the inquiry endpoint:

   ```env
   VITE_INQUIRY_API_URL=https://abc123.execute-api.ap-south-1.amazonaws.com/%24default
   ```

   Alternatively use `$$default` — if the URL becomes `.../$` (broken), see `src/utils/inquiryUrl.js` or switch to `%24default`.

2. Build and deploy:

   ```bash
   npm run build
   ```

3. Deploy `dist/` to S3 (see `docs/S3_HOSTING.md` or `npm run deploy:s3`).

The browser will **POST** to:

- `POST {VITE_* base}/api/inquiries`

which invokes your Lambda. If neither variable is set in dev, `/api/inquiries` is proxied to `localhost:3001` (Express) instead.

#### Changing to a different invoke URL

If you create a **new** HTTP API, change **stage** (`prod` vs `$default`), or copy the wrong **Invoke URL** once:

1. **Update env** — Set **`VITE_INQUIRY_API_URL`** (recommended) or **`VITE_API_URL`** to the **exact** base from **API Gateway → your API → Invoke URL** (include the stage path: `/prod`, `/dev`, or `/%24default` for `$default`).
2. **Rebuild** — Vite inlines these at **`npm run build`**. Editing `.env` alone does **not** change the files already in S3; run **`npm run build`** and **upload `dist/`** again.
3. **Dev** — Restart **`npm run dev`** after changing `.env` so Vite picks up the new URL and the inquiry proxy target updates.
4. **Lambda** — The **same** Lambda can be attached to the new API, or you point the new route’s integration to **`hds-inquiry-lambda`**. You do **not** need to change the frontend if only the Gateway URL changed.
5. **CORS** — On the **new** API, enable **CORS** (or rely on the Lambda handler’s headers) for your site origin(s); a new API does not inherit settings from the old one.

---

### 4. Frontend behavior

No code changes are needed in the `Inquiry` page. It already:

- Submits the form to `hdsApi.submitInquiry`
- Shows “Inquiry Sent” on success
- Shows a validation / error message if the API call fails

As long as:

- **`VITE_INQUIRY_API_URL`** or **`VITE_API_URL`** points to your API Gateway base URL, and
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
- **VITE_API_URL** (or **VITE_INQUIRY_API_URL**): set to `$ENDPOINT/$default` — in `.env` use **`%24default`** (recommended) or **`$$default`** (see §3).

---

### 6. Email via SES (required for production)

The handler sends mail with **Amazon SES**. Configure:

1. **Lambda environment:** `INQUIRY_TO_EMAIL` (inbox that receives inquiries), `INQUIRY_FROM_EMAIL` (optional; must be a **verified identity** in SES, often same as `INQUIRY_TO_EMAIL`).
2. **Same region:** SES identities and the Lambda function should use the **same AWS Region** (e.g. both `us-east-1`).
3. **IAM:** On the Lambda execution role, allow `ses:SendEmail` (or `ses:SendRawEmail`) for the verified identities.
4. **SES sandbox:** In sandbox mode you can only send **to and from verified addresses**. Either verify the destination email or [request production access](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html).

Redeploy Lambda after changing env vars: `.\scripts\create-inquiry-lambda.ps1` (same `REGION`).

### 7. Troubleshooting HTTP 500 / “Send inquiry failed”

| Symptom | What to check |
|--------|----------------|
| **500** + `Inquiry email destination not configured` | Set `INQUIRY_TO_EMAIL` on the Lambda in the console (Configuration → Environment variables). |
| **502** / message about **SES** | Verify **sender and recipient** in SES, IAM `ses:SendEmail`, same region as Lambda, sandbox rules above. Check **CloudWatch Logs** for the function for the raw AWS error. |
| **404** from API | Path must include `/api/inquiries`. Base URL must include the **`$default`** stage if your API uses it (`…/$$default` in Vite `.env`). |
| Works locally but not on the live site | Set **`FRONTEND_ORIGIN`** on Lambda. Use **comma-separated** origins if you open the site from **both** the **S3 website URL** and **https://hamiltondesilvansons.com** (they send different `Origin` headers). Example: `https://hamiltondesilvansons.com,http://hds-website-hosting-bucket.s3-website-us-east-1.amazonaws.com` — no spaces after commas, no trailing slashes. Or **clear** `FRONTEND_ORIGIN` to allow `*` from the handler. Rebuild/redeploy the static site with **`VITE_INQUIRY_API_URL`** pointing at API Gateway. |
| **500** only when running against **localhost** backend | MongoDB or server error — start the API (`npm run dev:api`) and ensure `MONGODB_URI` is valid. |
| **`ENOTFOUND`** / **Non-existent domain** for `….execute-api….amazonaws.com` | The **API id** in the URL is wrong, or the HTTP API was **deleted**. Open **API Gateway** → your API → copy **Invoke URL** and set **`VITE_INQUIRY_API_URL`** to that host + stage (e.g. `…/%24default` for a `$default` stage). Confirm with `nslookup your-id.execute-api.region.amazonaws.com` — it must resolve. |

### 8. “Inquiry received” but no email in the inbox

**First, confirm which backend handled the request**

| How you’re running | What happens |
|--------------------|----------------|
| **Lambda** (API Gateway URL in `VITE_INQUIRY_API_URL` / production build) | Email is sent only via **SES**. The Express app is **not** used. |
| **Local Express** (`/api/inquiries` proxied to port 3001, no inquiry URL in env) | Data is saved to **MongoDB only**. **No email is sent** — the Node route does not call SES. |

If you see **“Inquiry received”** from the **local API**, that success does **not** mean an email was sent.

**If Lambda + SES is used and you still get no mail**

1. **`INQUIRY_TO_EMAIL` on the Lambda** must be the mailbox you check (and typo-free). Redeploy or update env in the console.
2. **SES sandbox:** You can only send **to** and **from** [verified identities](https://docs.aws.amazon.com/ses/latest/dg/verify-addresses-and-domains.html). Verify the **inbox** address (and usually the **From** address). Request [production access](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html) to send to arbitrary addresses.
3. **Same region:** Open **SES** in the **same region** as the Lambda function. Sending is configured per region.
4. **Spam / promotions:** Search spam and “All mail” for the **From** identity or subject `New inquiry from`.
5. **SES metrics:** In **SES → Account dashboard → Sending statistics**, see if **Sends** increases when you submit. If **Bounces** or **Complaints** increase, open **Configuration sets / SNS** or **SES event publishing** for details.
6. **CloudWatch:** After a submit, logs should show `Inquiry email sent via SES` with **`sesMessageId`**. If that line is missing but you still get HTTP 201, check you’re looking at the latest log stream. If SES failed, the handler usually returns **502** with an error body, not 201.

### 9. CORS diagnosis (S3 website → API Gateway)

**Why a console test can pass while the live site fails**

- A manual **OPTIONS** test in API Gateway (or `curl`) does not send the same **`Origin`** header as your browser when the page is loaded from the S3 website URL.
- **Preflight (OPTIONS)** and the actual **POST** must both return usable CORS headers. Check DevTools → **Network** for **both** requests to the same invoke URL (same stage as in `VITE_INQUIRY_API_URL`).

**Checklist**

| Check | Detail |
|--------|--------|
| **S3 URL vs custom domain** | Loading **`http://…s3-website-….amazonaws.com`** sends **`Origin: http://…`**; **`https://hamiltondesilvansons.com`** sends a different **`Origin`**. Put **both** in **`FRONTEND_ORIGIN`** (comma-separated), or leave **`FRONTEND_ORIGIN`** unset so the handler returns **`Access-Control-Allow-Origin: *`**. |
| **Exact origin** | Each value in `FRONTEND_ORIGIN` must match **scheme + host + port** of the page (`http` vs `https`, bucket hostname vs custom domain). |
| **Same API URL in build** | Production build must embed the **same** base as you test (stage path, e.g. `…/$default` / `%24default` in `.env`). |
| **POST response** | On failure, open the **POST** row → **Headers** → response must include `Access-Control-Allow-Origin` (either `*` or your exact origin). If only OPTIONS has CORS and POST does not, the integration is stripping or overriding headers on success/error paths. |
| **API Gateway CORS** | If the HTTP API has **CORS** configured in the console, ensure it does not conflict with Lambda-returned headers (duplicate or wrong origin). Prefer one source of truth: either Gateway-managed CORS or Lambda headers, aligned. |

**Quick isolation**

1. Clear **`FRONTEND_ORIGIN`** on Lambda (handler uses `Access-Control-Allow-Origin: *`) and redeploy — if the site works, the previous allowlist did not include the real browser `Origin`.
2. Or set **`FRONTEND_ORIGIN`** to **comma-separated** values: copy **`Origin`** from DevTools for **each** place you host the app (S3 website URL and custom domain) and join with commas (no spaces).
3. If preflight still has **no** CORS headers, **OPTIONS** may not be reaching Lambda (wrong route / API Gateway error). In **API Gateway** → your HTTP API → **CORS** or routes, ensure **`OPTIONS`** is allowed for `/prod/api/inquiries` (or use **`ANY`** on that path to the same Lambda).

### 10. `net::ERR_CONNECTION_REFUSED` / `net::ERR_FAILED` **and** “No `Access-Control-Allow-Origin`”

These often appear **together** but mean different layers:

| What you see | What it usually means |
|----------------|----------------------|
| **`net::ERR_CONNECTION_REFUSED`** | The browser **never completed a TCP connection** to `…execute-api….amazonaws.com` (nothing accepted the connection on that host/port). This is **not** a Lambda CORS bug — it happens **before** HTTP. |
| **CORS: no `Access-Control-Allow-Origin`** | If there is **no HTTP response** (connection failed, timeout, or TLS error), the response has **no** CORS headers. Chrome still labels it as a CORS failure even though the real problem is **no response**. |
| **`Failed to load resource: net::ERR_FAILED`** | Generic failure; often follows the same underlying network error. |

**Fix the connection first**, then worry about CORS:

1. **Same machine, outside the browser:** `curl -v -X OPTIONS "https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/inquiries"` — if this also fails to connect, the issue is **network / DNS / firewall / VPN**, not your React app or Lambda CORS.
2. **DNS:** `nslookup YOUR_API_ID.execute-api.us-east-1.amazonaws.com` must resolve to AWS. Wrong or blocked DNS can point to a host that **refuses** connections.
3. **Firewall / VPN / corporate network:** Some networks block or throttle AWS endpoints. Try another network or disable VPN temporarily.
4. **API still exists:** In **API Gateway**, confirm the API id and **Invoke URL** match what’s in **`VITE_INQUIRY_API_URL`** in your production build. A deleted or wrong API id can produce confusing errors depending on DNS.

Only after **`curl` returns HTTP** (e.g. 204 or 405 with headers) does it make sense to tune **`FRONTEND_ORIGIN`** and Lambda CORS again.


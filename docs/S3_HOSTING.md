# Hosting the frontend on AWS S3

This app is a static Vite + React build, so it can be served from an S3 bucket with **Static website hosting** enabled.

## Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) installed and configured (`aws configure`)
- An S3 bucket (e.g. `hds-website` or your domain bucket)

## 1. Create and configure the S3 bucket

### Create the bucket

- In **AWS Console**: S3 → Create bucket → choose a name (e.g. `hds-website`), pick a region, leave block public access as-is for now (we’ll use a bucket policy).
- Or with CLI (replace name and region):

```bash
aws s3 mb s3://YOUR_BUCKET_NAME --region us-east-1
```

### Enable static website hosting

- In **AWS Console**: Open the bucket → **Properties** → **Static website hosting** → **Edit**:
  - **Hosting type**: Enable static website hosting
  - **Index document**: `index.html`
  - **Error document**: `index.html` (so React Router handles routes like `/shop`, `/elevator` on refresh/direct open)
  - Save

Or with CLI:

```bash
aws s3 website s3://YOUR_BUCKET_NAME --index-document index.html --error-document index.html
```

### Allow public read for website access

- In **AWS Console**: Bucket → **Permissions** → **Bucket policy** → **Edit**, then use a policy like (replace `YOUR_BUCKET_NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

- If the bucket has “Block all public access” on, turn off the **Block public access** settings for this bucket (or at least allow public bucket policies) so the policy above works.

## 2. Deploy the frontend

Build and upload the contents of `dist/` to the bucket:

```bash
# Set your bucket name (PowerShell)
$env:BUCKET_NAME = "hds-website-hosting-bucket"
node scripts/deploy-s3.mjs

# Or one-liner (PowerShell)
$env:BUCKET_NAME="hds-website"; node scripts/deploy-s3.mjs
```

Or with AWS CLI only (after `npm run build`):

```bash
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete
```

- `--delete` removes objects in S3 that are no longer in `dist/`.

## 3. Open the site

- In **AWS Console**: Bucket → **Properties** → **Static website hosting** → **Bucket website endpoint** (e.g. `http://YOUR_BUCKET_NAME.s3-website-us-east-1.amazonaws.com`).
- Or:

```text
http://YOUR_BUCKET_NAME.s3-website-REGION.amazonaws.com
```

Use the **website endpoint** (e.g. `s3-website-...`), not the **S3 object URL** (e.g. `s3.amazonaws.com/...`), so that index/error documents and routing work correctly.

## 4. (Optional) Custom domain and HTTPS with CloudFront

1. Create a **CloudFront distribution**:
   - **Origin domain**: choose the S3 **website endpoint** (e.g. `YOUR_BUCKET_NAME.s3-website-us-east-1.amazonaws.com`), not the S3 bucket list-objects endpoint.
   - **Default root object**: `index.html`.
   - Under **Error pages**: add a custom error response for **403** and **404** with **Response page path** `/index.html`, **HTTP response code** `200`, so client-side routes work when users open or refresh deep links.

2. Point your domain to the CloudFront distribution (CNAME or Route 53 alias).

3. Request or attach an ACM certificate in us-east-1 for HTTPS.

## 5. Backend / API

This frontend talks to an API (e.g. `/api` proxied to `localhost:3001` in dev). For production:

- Host the backend elsewhere (e.g. EC2, ECS, Lambda, or another server) and set the API base URL in the app (e.g. via env or config).
- If you use CloudFront, you can add a behavior that forwards `/api` to the backend origin.

## Quick reference

| Step              | Action |
|-------------------|--------|
| Build             | `npm run build` |
| Deploy to S3      | `BUCKET_NAME=your-bucket node scripts/deploy-s3.mjs` or `aws s3 sync dist/ s3://your-bucket --delete` |
| Index / Error doc | Both set to `index.html` for React Router |
| Public access     | Bucket policy above + unblock public access if needed |

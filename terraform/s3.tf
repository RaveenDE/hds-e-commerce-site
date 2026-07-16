# S3 Bucket for static site content
resource "aws_s3_bucket" "site" {
  bucket = local.bucket_name

  tags = merge(
    var.tags,
    {
      Name = local.bucket_name
    }
  )
}

# Bucket versioning for safety
resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Block all public access (CloudFront will access via OAI)
resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Bucket policy - Allow CloudFront OAI to access
resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOAI"
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.oai.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.site.arn}/*"
      },
      {
        Sid    = "AllowCloudFrontOAIListBucket"
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.oai.iam_arn
        }
        Action   = "s3:ListBucket"
        Resource = aws_s3_bucket.site.arn
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.site]
}

# Server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Optional: CloudFront OAI for S3 access
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for ${var.project_name}"
}

# Optional: S3 bucket for redirect (subdomain to main)
resource "aws_s3_bucket" "redirect" {
  count  = var.enable_subdomain_redirect ? 1 : 0
  bucket = local.redirect_bucket_name

  tags = merge(
    var.tags,
    {
      Name = local.redirect_bucket_name
    }
  )
}

# Redirect bucket versioning
resource "aws_s3_bucket_versioning" "redirect" {
  count  = var.enable_subdomain_redirect ? 1 : 0
  bucket = aws_s3_bucket.redirect[0].id

  versioning_configuration {
    status = "Enabled"
  }
}

# Redirect bucket policy - Allow CloudFront OAI
resource "aws_s3_bucket_policy" "redirect" {
  count  = var.enable_subdomain_redirect ? 1 : 0
  bucket = aws_s3_bucket.redirect[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOAI"
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.oai.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.redirect[0].arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.redirect[0]]
}

# Block public access for redirect bucket
resource "aws_s3_bucket_public_access_block" "redirect" {
  count  = var.enable_subdomain_redirect ? 1 : 0
  bucket = aws_s3_bucket.redirect[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Server-side encryption for redirect bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "redirect" {
  count  = var.enable_subdomain_redirect ? 1 : 0
  bucket = aws_s3_bucket.redirect[0].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

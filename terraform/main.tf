# Local variables
locals {
  bucket_name           = var.bucket_name != null ? var.bucket_name : "${var.domain_name}-site"
  redirect_bucket_name  = "${var.subdomain}.${var.domain_name}"
  website_domain        = "${var.subdomain}.${var.domain_name}"
  certificate_arn       = aws_acm_certificate.site.arn
}

# Route 53 Hosted Zone (optional)
resource "aws_route53_zone" "main" {
  count = var.create_hosted_zone ? 1 : 0
  name  = var.domain_name

  tags = merge(
    var.tags,
    {
      Name = var.domain_name
    }
  )
}

# ACM Certificate (must be in us-east-1 for CloudFront)
resource "aws_acm_certificate" "site" {
  provider          = aws.us_east_1
  domain_name       = local.website_domain
  validation_method = "DNS"

  subject_alternative_names = var.enable_subdomain_redirect ? [var.domain_name] : null

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(
    var.tags,
    {
      Name = local.website_domain
    }
  )
}

# Certificate validation with Route 53
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.site.domain_validation_options : dvo.domain => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

# Wait for certificate validation
resource "aws_acm_certificate_validation" "site" {
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.site.arn

  timeouts {
    create = "5m"
  }

  depends_on = [aws_route53_record.cert_validation]
}

# CloudFront distribution for main site
resource "aws_cloudfront_distribution" "site" {
  origin {
    domain_name = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id   = "S3Origin"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  # Optional: Secondary origin for redirect bucket
  dynamic "origin" {
    for_each = var.enable_subdomain_redirect ? [1] : []
    content {
      domain_name = aws_s3_bucket.redirect[0].bucket_regional_domain_name
      origin_id   = "RedirectOrigin"

      s3_origin_config {
        origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
      }
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = var.index_document
  price_class         = "PriceClass_100"

  # Default cache behavior for main site
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Origin"
    compress         = var.enable_compression

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = var.cache_ttl_min
    default_ttl            = var.cache_ttl_default
    max_ttl                = var.cache_ttl_max
  }

  # Cache behavior for index.html (no caching)
  cache_behavior {
    path_pattern     = "index.html"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Origin"
    compress         = var.enable_compression

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  # Cache behavior for static assets (long cache)
  cache_behavior {
    path_pattern     = "*.{js,css,png,jpg,jpeg,gif,svg,webp,woff,woff2,ttf,eot,ico}"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Origin"
    compress         = var.enable_compression

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "allow-all"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
  }

  # Custom error response to serve index.html for SPA routing
  custom_error_response {
    error_code            = 404
    response_code         = 200
    error_caching_min_ttl = 0
    response_page_path    = "/${var.index_document}"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  depends_on = [aws_acm_certificate_validation.site]

  tags = merge(
    var.tags,
    {
      Name = local.website_domain
    }
  )
}

# CloudFront distribution for redirect (if enabled)
resource "aws_cloudfront_distribution" "redirect" {
  count = var.enable_subdomain_redirect ? 1 : 0

  origin {
    domain_name = aws_s3_bucket.redirect[0].bucket_regional_domain_name
    origin_id   = "RedirectOrigin"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  enabled         = true
  is_ipv6_enabled = true
  price_class     = "PriceClass_100"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "RedirectOrigin"
    compress         = var.enable_compression

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = var.cache_ttl_min
    default_ttl            = var.cache_ttl_default
    max_ttl                = var.cache_ttl_max
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  depends_on = [aws_acm_certificate_validation.site]

  tags = merge(
    var.tags,
    {
      Name = var.domain_name
    }
  )
}

# Data source for existing Route 53 zone
data "aws_route53_zone" "main" {
  name = var.domain_name
}

# Route 53 DNS record for main site (A record)
resource "aws_route53_record" "site_a" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = local.website_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route 53 DNS record for main site (AAAA record - IPv6)
resource "aws_route53_record" "site_aaaa" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = local.website_domain
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route 53 DNS records for redirect domain (if enabled)
resource "aws_route53_record" "redirect_a" {
  count   = var.enable_subdomain_redirect ? 1 : 0
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.redirect[0].domain_name
    zone_id                = aws_cloudfront_distribution.redirect[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "redirect_aaaa" {
  count   = var.enable_subdomain_redirect ? 1 : 0
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.redirect[0].domain_name
    zone_id                = aws_cloudfront_distribution.redirect[0].hosted_zone_id
    evaluate_target_health = false
  }
}

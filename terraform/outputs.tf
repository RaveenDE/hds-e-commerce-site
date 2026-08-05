output "s3_bucket_name" {
  description = "S3 bucket name for the static site"
  value       = aws_s3_bucket.site.id
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.site.arn
}

output "s3_bucket_region" {
  description = "S3 bucket region"
  value       = aws_s3_bucket.site.region
}

output "redirect_s3_bucket_name" {
  description = "S3 bucket name for redirects (if enabled)"
  value       = null
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for main site"
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_distribution_domain" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.site.domain_name
}

output "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.site.arn
}

output "cloudfront_redirect_distribution_id" {
  description = "CloudFront distribution ID for redirects (if enabled)"
  value       = var.enable_subdomain_redirect ? aws_cloudfront_distribution.redirect[0].id : null
}

output "cloudfront_oai_id" {
  description = "CloudFront Origin Access Identity ID"
  value       = aws_cloudfront_origin_access_identity.oai.id
}

output "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = local.hosted_zone_id
}

output "website_domain" {
  description = "Website domain name"
  value       = aws_route53_record.site_a.fqdn
}

output "acm_certificate_arn" {
  description = "ACM certificate ARN"
  value       = aws_acm_certificate_validation.site.certificate_arn
}

output "deployment_commands" {
  description = "Commands to deploy the site to S3"
  value = {
    sync_all     = "aws s3 sync ./dist s3://${aws_s3_bucket.site.id} --delete"
    sync_specific = "aws s3 sync ./dist s3://${aws_s3_bucket.site.id}"
    invalidate   = "aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.site.id} --paths '/*'"
  }
}

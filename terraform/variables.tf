variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for tagging and naming resources"
  type        = string
  default     = "hds-site"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "Domain name for the website (e.g., example.com)"
  type        = string
}

variable "subdomain" {
  description = "Optional subdomain (e.g., www or api)"
  type        = string
  default     = "www"
}

variable "bucket_name" {
  description = "S3 bucket name for static site content"
  type        = string
  default     = null
}

variable "enable_subdomain_redirect" {
  description = "Enable redirect from subdomain to main domain (e.g., www to apex)"
  type        = bool
  default     = false
}

variable "hosted_zone_id" {
  description = "Route 53 hosted zone ID (if using existing zone)"
  type        = string
  default     = null
}

variable "create_hosted_zone" {
  description = "Create a new Route 53 hosted zone"
  type        = bool
  default     = false
}

variable "index_document" {
  description = "S3 index document"
  type        = string
  default     = "index.html"
}

variable "error_document" {
  description = "S3 error document"
  type        = string
  default     = "index.html"
}

variable "cache_ttl_default" {
  description = "Default cache TTL in seconds"
  type        = number
  default     = 3600
}

variable "cache_ttl_max" {
  description = "Maximum cache TTL in seconds"
  type        = number
  default     = 86400
}

variable "cache_ttl_min" {
  description = "Minimum cache TTL in seconds"
  type        = number
  default     = 0
}

variable "enable_compression" {
  description = "Enable CloudFront compression"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "location" {
  description = "Azure region for the lab resources"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the Resource Group"
  type        = string
}

variable "storage_account_name_01" {
  description = "Globally unique storage account name (lowercase letters and numbers only)"
  type        = string
}

variable "storage_account_name_02" {
  description = "Globally unique storage account name (lowercase letters and numbers only)"
  type        = string
}

variable "storage_share_name_01" {
  description = "Name of the file share to create in stlab01"
  type        = string
  default     = "share01"
}

variable "storage_share_quota_gb_01" {
  description = "Quota in GB for the file share in stlab01"
  type        = number
  default     = 50
}

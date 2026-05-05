output "resource_group_name" {
  value = azurerm_resource_group.rglab.name
}

output "storage_account_name_01" {
  value = azurerm_storage_account.stlab01.name
}

output "storage_account_name_02" {
  value = azurerm_storage_account.stlab02.name
}

output "storage_account_primary_blob_endpoint_01" {
  value = azurerm_storage_account.stlab01.primary_blob_endpoint
}

output "storage_account_primary_blob_endpoint_02" {
  value = azurerm_storage_account.stlab02.primary_blob_endpoint
}

output "storage_share_name_01" {
  value = azurerm_storage_share.share01.name
}

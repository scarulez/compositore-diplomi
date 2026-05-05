terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rglab" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    environment = "env-lab1"
    project     = "terraform-basics"
  }
}

resource "azurerm_storage_account" "stlab01" {
  name                     = var.storage_account_name_01
  resource_group_name      = azurerm_resource_group.rglab.name
  location                 = azurerm_resource_group.rglab.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = {
    environment = "env-lab1"
    project     = "terraform-basics"
  }
}

resource "azurerm_storage_account" "stlab02" {
  name                     = var.storage_account_name_02
  resource_group_name      = azurerm_resource_group.rglab.name
  location                 = azurerm_resource_group.rglab.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = {
    environment = "env-lab1"
    project     = "terraform-basics"
  }
}

resource "azurerm_storage_share" "share01" {
  name               = var.storage_share_name_01
  storage_account_id = azurerm_storage_account.stlab01.id
  quota              = var.storage_share_quota_gb_01
  enabled_protocol   = "SMB"
}

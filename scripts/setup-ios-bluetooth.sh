#!/bin/bash

# iOS Bluetooth Permissions Configuration
# Run this after: npx cap open ios

INFO_PLIST_PATH="ios/App/App/Info.plist"

# Check if plist exists
if [ ! -f "$INFO_PLIST_PATH" ]; then
    echo "Error: Info.plist not found at $INFO_PLIST_PATH"
    exit 1
fi

# Add Bluetooth permissions to Info.plist using plutil
plutil -insert NSBluetoothPeripheralUsageDescription -string "Diese App braucht Bluetooth um Freunde in der Nähe zu entdecken" "$INFO_PLIST_PATH"
plutil -insert NSBluetoothCentralUsageDescription -string "Diese App braucht Bluetooth um Freunde in der Nähe zu entdecken" "$INFO_PLIST_PATH"
plutil -insert NSLocalNetworkUsageDescription -string "Diese App nutzt lokale Netzwerke für die Nearby Discovery" "$INFO_PLIST_PATH"
plutil -insert NSBonjourServices -string "_http._tcp" "$INFO_PLIST_PATH"

echo "✅ iOS Bluetooth Permissions hinzugefügt!"
echo "Bitte öffne die App in Xcode und überprüfe die Info.plist"

# Force TLS 1.2
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$LauncherDir = Resolve-Path "$ScriptDir\..\.."
$DestDir = "$LauncherDir\resources\models"
$ModelName = "qwen2.5-0.5b-instruct-q4_k_m.gguf"
$DestFile = "$DestDir\$ModelName"
$ModelUrl = "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/$ModelName"

Write-Host "Target: $DestFile"

# Clean up partial/wrong downloads
if (Test-Path $DestFile) {
    $size = (Get-Item $DestFile).Length / 1MB
    if ($size -lt 300) {
        Write-Host "Removing partial download ($size MB)..."
        Remove-Item $DestFile -Force
    } else {
        Write-Host "File already exists and seems complete ($size MB)."
        exit 0
    }
}

if (!(Test-Path $DestDir)) {
    New-Item -ItemType Directory -Force -Path $DestDir | Out-Null
}

Write-Host "Downloading $ModelName (~400MB) using BITS..."

try {
    Import-Module BitsTransfer
    Start-BitsTransfer -Source $ModelUrl -Destination $DestFile -Priority Foreground -Description "Downloading Qwen Model"
    
    $size = (Get-Item $DestFile).Length / 1MB
    Write-Host "Download Complete. Size: $($size.ToString("N2")) MB"
    
    if ($size -lt 300) {
        throw "File too small ($size MB). Download likely failed."
    }
} catch {
    Write-Warning "BITS failed: $_. Falling back to Invoke-WebRequest..."
    try {
        Invoke-WebRequest -Uri $ModelUrl -OutFile $DestFile -UseBasicParsing
        $size = (Get-Item $DestFile).Length / 1MB
        Write-Host "Download Complete via WebRequest. Size: $($size.ToString("N2")) MB"
    } catch {
        Write-Error "All download methods failed: $_"
        exit 1
    }
}

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$gatewayScript = Join-Path $PSScriptRoot 'ollama-proxy.mjs'
$ngrokEndpointConfig = Join-Path $projectRoot 'ngrok.yml'
$ngrokAgentConfig = Join-Path $env:LOCALAPPDATA 'ngrok\ngrok.yml'
$nodePath = (Get-Command node -ErrorAction Stop).Source
$ngrokPath = (Get-Command ngrok -ErrorAction Stop).Source
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name

foreach ($requiredPath in @($gatewayScript, $ngrokEndpointConfig)) {
  if (-not (Test-Path -LiteralPath $requiredPath)) {
    throw "Required file was not found: $requiredPath"
  }
}

& $ngrokPath config check --config $ngrokAgentConfig --config $ngrokEndpointConfig | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw 'The combined ngrok configuration is invalid.'
}

$trigger = New-ScheduledTaskTrigger -AtLogOn -User $currentUser
$principal = New-ScheduledTaskPrincipal -UserId $currentUser -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit ([TimeSpan]::Zero) `
  -RestartCount 20 `
  -RestartInterval (New-TimeSpan -Minutes 1)

$gatewayAction = New-ScheduledTaskAction `
  -Execute $nodePath `
  -Argument "`"$gatewayScript`"" `
  -WorkingDirectory $projectRoot

$ngrokAction = New-ScheduledTaskAction `
  -Execute $ngrokPath `
  -Argument "start valen-buddy --config `"$ngrokAgentConfig`" --config `"$ngrokEndpointConfig`"" `
  -WorkingDirectory $projectRoot

Register-ScheduledTask `
  -TaskName 'Valen Buddy Ollama Gateway' `
  -Description 'Starts the authenticated local gateway used by the Winds of Valen wiki.' `
  -Action $gatewayAction `
  -Trigger $trigger `
  -Settings $settings `
  -Principal $principal `
  -Force | Out-Null

Register-ScheduledTask `
  -TaskName 'Valen Buddy ngrok Tunnel' `
  -Description 'Starts the fixed ngrok tunnel used by the Winds of Valen wiki.' `
  -Action $ngrokAction `
  -Trigger $trigger `
  -Settings $settings `
  -Principal $principal `
  -Force | Out-Null

Start-ScheduledTask -TaskName 'Valen Buddy Ollama Gateway'
Start-Sleep -Seconds 2
Start-ScheduledTask -TaskName 'Valen Buddy ngrok Tunnel'

Write-Host 'Valen Buddy startup tasks registered and started.'

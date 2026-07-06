$desktop = [Environment]::GetFolderPath('Desktop')
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($desktop + '\Gwent Server.lnk')
$Shortcut.TargetPath = 'C:\Users\Рафаил\.gemini\antigravity\scratch\gwent-web\run_server.bat'
$Shortcut.WorkingDirectory = 'C:\Users\Рафаил\.gemini\antigravity\scratch\gwent-web'
$Shortcut.Description = 'Start Gwent Multiplayer Server'
$Shortcut.Save()
Write-Output "Shortcut created successfully at: $desktop"

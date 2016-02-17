Write-Host "Decrypting *.enc file with secure-file"
nuget install secure-file -ExcludeVersion
Get-Item *.enc | % { secure-file\tools\secure-file -decrypt $_.Name -secret $($env:encrypt_token) }
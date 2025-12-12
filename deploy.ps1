# Deploy to GitHub Script
# Run this from the project root directory

Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan

# Initialize git if not already initialized
if (-not (Test-Path .git)) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# Add all files
Write-Host "Adding files..." -ForegroundColor Yellow
git add .

# Commit
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Deploy birthday quiz app"
}

Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m $commitMessage

# Add remote if not exists
$remoteExists = git remote | Select-String "origin"
if (-not $remoteExists) {
    Write-Host "Adding remote repository..." -ForegroundColor Yellow
    git remote add origin https://github.com/HarisBeg26/nedim-bday.git
}

# Push
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Deploy backend to Render: https://dashboard.render.com/" -ForegroundColor White
Write-Host "2. Deploy frontend to Vercel: https://vercel.com/new" -ForegroundColor White
Write-Host "3. See DEPLOYMENT.md for detailed instructions" -ForegroundColor White

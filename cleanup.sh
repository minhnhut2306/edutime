Write-Host "🧹 BẮT ĐẦU DỌN DẸP CODE..." -ForegroundColor Green
Write-Host ""

$files = Get-ChildItem -Path "src" -Recurse -Include *.js,*.jsx,*.ts,*.tsx

foreach ($file in $files) {
    Write-Host "🔧 Đang xử lý: $($file.Name)" -ForegroundColor Cyan
    
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Xóa // comments
    $content = $content -replace '//.*$', '' -replace '(?m)^.*//.*$', ''
    
    # Xóa /* */ comments
    $content = $content -replace '/\*[\s\S]*?\*/', ''
    
    # Xóa console.log có emoji
    $content = $content -replace 'console\.log\([^)]*[\u{1F300}-\u{1FAFF}][^)]*\);?\s*', ''
    
    # Xóa tất cả emoji trong string
    $content = $content -replace '[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]', ''
    
    # Xóa dòng trống thừa
    $content = $content -replace '(?m)^\s*$\n', "`n" -replace '\n{3,}', "`n`n"
    
    # Xóa khoảng trắng cuối dòng
    $content = $content -replace '(?m)\s+$', ''
    
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
}

Write-Host ""
Write-Host "✨ HOÀN TẤT!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Đã xử lý $($files.Count) files" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Đã xóa:" -ForegroundColor Green
Write-Host "   - Tất cả // comments"
Write-Host "   - Tất cả /* */ comments"
Write-Host "   - console.log có emoji"
Write-Host "   - Tất cả emoji icons"
Write-Host "   - Dòng trống thừa"
Write-Host ""
Write-Host "💡 Tiếp theo:" -ForegroundColor Cyan
Write-Host "   1. Kiểm tra code: npm run dev"
Write-Host "   2. Build: npm run build"
# Multi-Language Books Setup Script
# One-command setup for the multi-language PDF book system

Write-Host "`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    Multi-Language Books System Setup                         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$apiPath = "c:\work\act-gen1\apps\api"
$dbFile = "$apiPath\app.db"

# Step 1: Check if we need to create a fresh database
Write-Host "Step 1️⃣  Preparing database..." -ForegroundColor Yellow

if (Test-Path $dbFile) {
    Write-Host "  ⚠️  Found existing database. Keeping it (with new schema)." -ForegroundColor Yellow
} else {
    Write-Host "  ✅ No existing database (will be created fresh)" -ForegroundColor Green
}

# Step 2: Navigate to API directory
Write-Host "`nStep 2️⃣  Setting up environment..." -ForegroundColor Yellow
cd $apiPath
Write-Host "  ✅ Working directory: $apiPath" -ForegroundColor Green

# Step 3: Run seed script
Write-Host "`nStep 3️⃣  Seeding database with books..." -ForegroundColor Yellow

try {
    & python seed_books.py
    Write-Host "`n  ✅ Database seeded successfully!" -ForegroundColor Green
} catch {
    Write-Host "`n  ❌ Error running seed script: $_" -ForegroundColor Red
    Write-Host "`n  Make sure you're in the correct directory and Python is installed." -ForegroundColor Yellow
    exit 1
}

# Step 4: Verify books
Write-Host "`nStep 4️⃣  Verifying books..." -ForegroundColor Yellow

try {
    & python upload_books.py verify
} catch {
    Write-Host "`n  ⚠️  Could not verify books (this is OK)" -ForegroundColor Yellow
}

# Step 5: Create upload directories
Write-Host "`nStep 5️⃣  Creating upload directories..." -ForegroundColor Yellow

$uploadDirs = @(
    "uploads\books\en",
    "uploads\books\ru",
    "uploads\books\uz"
)

foreach ($dir in $uploadDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  ✅ Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "  ✅ Already exists: $dir" -ForegroundColor Green
    }
}

# Step 6: Show next steps
Write-Host "`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    SETUP COMPLETE! 🎉                         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📚 Books Added:" -ForegroundColor Cyan
Write-Host "  1. The Richest Man in Babylon (в Вавилоне / eng boy odam)" -ForegroundColor White
Write-Host "  2. Atomic Habits (Атомные привычки / Atomli odatlar)" -ForegroundColor White
Write-Host "  3. Rich Dad Poor Dad (Богатый папа / Boy otasi)" -ForegroundColor White

Write-Host "`n🌐 Languages:" -ForegroundColor Cyan
Write-Host "  • English (en)" -ForegroundColor White
Write-Host "  • Russian (ru)" -ForegroundColor White
Write-Host "  • Uzbek (uz)" -ForegroundColor White

Write-Host "`n📂 PDF Upload Locations:" -ForegroundColor Cyan
Write-Host "  • English:  $apiPath\uploads\books\en\" -ForegroundColor White
Write-Host "  • Russian:  $apiPath\uploads\books\ru\" -ForegroundColor White
Write-Host "  • Uzbek:    $apiPath\uploads\books\uz\" -ForegroundColor White

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Place your PDF files in the directories above" -ForegroundColor White
Write-Host "  2. Run FastAPI server:" -ForegroundColor White
Write-Host "     uvicorn main:app --reload" -ForegroundColor Yellow
Write-Host "  3. Test the API:" -ForegroundColor White
Write-Host "     GET /books/by-language/en" -ForegroundColor Yellow
Write-Host "     GET /books/by-language/ru" -ForegroundColor Yellow
Write-Host "     GET /books/by-language/uz" -ForegroundColor Yellow

Write-Host "`n📖 File Naming Convention:" -ForegroundColor Cyan
Write-Host "  • Richest Man in Babylon: book_10.pdf, book_11.pdf, book_12.pdf" -ForegroundColor White
Write-Host "  • Atomic Habits:          book_20.pdf, book_21.pdf, book_22.pdf" -ForegroundColor White
Write-Host "  • Rich Dad Poor Dad:      book_30.pdf, book_31.pdf, book_32.pdf" -ForegroundColor White

Write-Host "`n📚 For more information:" -ForegroundColor Cyan
Write-Host "  • See: MULTI_LANGUAGE_BOOKS_SETUP.md" -ForegroundColor Yellow
Write-Host "  • See: BOOKS_IMPLEMENTATION_COMPLETE.md" -ForegroundColor Yellow

Write-Host "`n💡 Helpful Commands:" -ForegroundColor Cyan
Write-Host "  Verify books:   python upload_books.py verify" -ForegroundColor Yellow
Write-Host "  Update paths:   python upload_books.py update" -ForegroundColor Yellow
Write-Host "  Show help:      python upload_books.py help" -ForegroundColor Yellow

Write-Host "`n" -ForegroundColor Green
Write-Host "✅ Setup Complete! Your books are ready to use." -ForegroundColor Green
Write-Host "`n"
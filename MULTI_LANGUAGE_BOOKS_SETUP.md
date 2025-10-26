# Multi-Language PDF Books System Setup Guide

## Overview
This guide explains how to set up and use the multi-language PDF book management system in your app.

**Books Added:**
1. **"The Richest Man in Babylon"** (Самый богатый человек в Вавилоне / Vavilondagi eng boy odam)
2. **"Atomic Habits"** (Атомные привычки / Atomli odatlar)
3. **"Rich Dad Poor Dad"** (Богатый папа, бедный папа / Boy otasi, kambag'al otasi)

**Languages Supported:** English (en), Russian (ru), Uzbek (uz)

---

## Part 1: Database Schema Update

The following fields were added to the `Book` model:

```python
language_code = Column(String, default="en", nullable=False)  # en, ru, uz
file_path = Column(String, nullable=True)  # e.g., "en/book_1.pdf"
file_size = Column(Integer, nullable=True)  # bytes
```

### Files Modified:
- ✅ `apps/api/models.py` - Added language_code, file_path, file_size fields
- ✅ `apps/api/schemas.py` - Updated BookCreate and BookOut schemas
- ✅ `apps/api/routers/books.py` - Added new endpoints and file handling

---

## Part 2: Database Migration

You have two options:

### Option A: Create a fresh database (Recommended for development)
```powershell
# Delete existing database file if it exists
rm .\apps\api\app.db

# Run your FastAPI server - it will create a new database
uvicorn apps.api.main:app --reload
```

### Option B: Run the migration script
```powershell
cd c:\work\act-gen1\apps\api

# Run the seed script to populate books
python seed_books.py
```

---

## Part 3: File Structure

The following directory structure will be created automatically:

```
c:\work\act-gen1\apps\api\
├── uploads/
│   └── books/
│       ├── en/
│       │   ├── book_10.pdf     # The Richest Man in Babylon
│       │   ├── book_20.pdf     # Atomic Habits
│       │   └── book_30.pdf     # Rich Dad Poor Dad
│       ├── ru/
│       │   ├── book_11.pdf     # Самый богатый человек в Вавилоне
│       │   ├── book_21.pdf     # Атомные привычки
│       │   └── book_31.pdf     # Богатый папа, бедный папа
│       └── uz/
│           ├── book_12.pdf     # Uzbek versions
│           ├── book_22.pdf
│           └── book_32.pdf
```

> **Note:** The directory structure is created automatically when files are uploaded.

---

## Part 4: Backend API Endpoints

### Get Books by Language
```
GET /books/by-language/{language_code}

Parameters:
- language_code: "en", "ru", or "uz"

Response: List of books in that language
```

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/books/by-language/en
```

### Upload PDF File
```
POST /books/{book_id}/upload

Parameters:
- book_id: ID of the book
- file: PDF file to upload (multipart form data)

Response:
{
  "message": "File uploaded successfully",
  "file_path": "en/book_10.pdf",
  "file_size": 2500000,
  "book_id": 10
}
```

**Example with cURL:**
```bash
curl -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/book.pdf" \
  http://localhost:8000/books/10/upload
```

### Download PDF File
```
GET /books/{book_id}/download

Parameters:
- book_id: ID of the book

Response: PDF file (binary)
```

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/books/10/download \
  -o "book.pdf"
```

---

## Part 5: Mobile App Integration

### Update to BooksScreen.tsx

Add language filtering to the existing book list:

```typescript
const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ru' | 'uz'>('en');

// Add language filter buttons in the UI
<View style={styles.languageFilter}>
  {['en', 'ru', 'uz'].map(lang => (
    <TouchableOpacity
      key={lang}
      onPress={() => setSelectedLanguage(lang)}
      style={[
        styles.languageButton,
        selectedLanguage === lang && styles.languageButtonActive
      ]}
    >
      <Text style={styles.languageButtonText}>
        {lang === 'en' ? '🇬🇧 English' : lang === 'ru' ? '🇷🇺 Русский' : '🇺🇿 Ўзбек'}
      </Text>
    </TouchableOpacity>
  ))}
</View>

// Fetch books by language
const loadBooksByLanguage = async () => {
  try {
    const response = await api.get(`/books/by-language/${selectedLanguage}`);
    setBooks(response.data);
  } catch (error) {
    console.error('Error loading books:', error);
  }
};
```

### Add File Upload to BooksScreen

```typescript
import * as DocumentPicker from 'expo-document-picker';

const handleUploadFile = async (bookId: number) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
    });

    if (result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: 'application/pdf',
        name: file.name,
      });

      const response = await api.post(`/books/${bookId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'PDF uploaded successfully!');
      await loadBooksByLanguage();
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to upload PDF');
  }
};
```

### Download and View PDF

```typescript
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';

const handleDownloadAndView = async (bookId: number, bookTitle: string) => {
  try {
    const response = await api.get(`/books/${bookId}/download`, {
      responseType: 'blob',
    });

    const downloadDir = FileSystem.DocumentDirectoryPath;
    const filePath = `${downloadDir}/${bookTitle}.pdf`;

    // Save file
    const base64 = await FileSystem.readAsStringAsync(response.config.url);
    await FileSystem.writeAsStringAsync(filePath, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Open PDF viewer
    navigation.navigate('PDFViewer', { filePath, title: bookTitle });
  } catch (error) {
    Alert.alert('Error', 'Failed to download PDF');
  }
};
```

---

## Part 6: Database Queries

### Get all books by language
```sql
SELECT * FROM books WHERE language_code = 'en' ORDER BY order_index;
```

### Get books with file uploads
```sql
SELECT * FROM books WHERE file_path IS NOT NULL AND language_code = 'ru';
```

### Get file statistics by language
```sql
SELECT 
  language_code,
  COUNT(*) as total_books,
  COUNT(CASE WHEN file_path IS NOT NULL THEN 1 END) as books_with_files,
  SUM(file_size) as total_storage_mb
FROM books
GROUP BY language_code;
```

---

## Part 7: Important Notes

### File Naming Convention
- Files are named by book ID, not title: `book_{id}.pdf`
- This avoids encoding issues with Cyrillic and special characters
- Real book titles are stored in the database

### File Size Limits
- Maximum file size: **50MB per PDF**
- This is enforced on the backend

### Directory Structure
```
uploads/books/
├── en/          # English PDFs
├── ru/          # Russian PDFs
└── uz/          # Uzbek PDFs
```

### How to Add More Books

1. Update `seed_books.py` with new book data
2. Re-run the seed script
3. Upload PDF files using the `/upload` endpoint

---

## Part 8: Troubleshooting

### Problem: "No PDF file available for this book"
**Solution:** Upload a PDF file first using the `/upload` endpoint

### Problem: Database shows language_code field missing
**Solution:** Delete your old database file and restart the server:
```powershell
rm .\apps\api\app.db
uvicorn apps.api.main:app --reload
```

### Problem: File upload fails with "File size exceeds 50MB limit"
**Solution:** Compress the PDF or split it into smaller files

### Problem: Cyrillic characters in file names cause issues
**Solution:** Files are intentionally named by ID (book_1.pdf) to avoid this

---

## Part 9: Future Enhancements

1. **Cloud Storage:** Migrate to AWS S3 or similar (minimal code changes needed)
2. **PDF Preview:** Add server-side image thumbnail generation
3. **Search:** Full-text search within PDF content
4. **Compression:** Automatic PDF compression for faster downloads
5. **Syncing:** Offline reading with automatic sync
6. **Annotations:** User highlights and notes within PDFs

---

## Testing Checklist

- [ ] Books appear in the correct language
- [ ] PDF files can be uploaded (< 50MB)
- [ ] PDF files can be downloaded
- [ ] File paths are correctly stored in database
- [ ] Reading progress still tracks correctly
- [ ] Deleting a book also deletes the PDF file
- [ ] Language filtering works correctly

---

**Created:** 2025
**Last Updated:** Now
**Status:** Ready for Testing ✅
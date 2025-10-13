# Quick Start: Income Feature

## 🚀 Start Everything

### Terminal 1: Backend
```bash
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api
.\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload
```

### Terminal 2: Mobile
```bash
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
npx expo start --clear
```

### Terminal 3: ngrok (if needed)
```bash
ngrok http 8000
# Update apps/mobile/.env with new URL
```

---

## 📱 Test the Income Feature

1. **Open Expo Go** on your phone
2. **Scan QR code** from terminal
3. **Login** with your account
4. **You'll see Income tab** (default screen)
5. **Tap the green + button** to add income
6. **Fill in:**
   - Amount: 1000
   - Date: Today
   - Note: "Test income"
7. **Tap "Save Income"**
8. **See it appear** in the list
9. **Check the total** at the top updates

---

## 🎯 Key Files

### Backend
- `apps/api/routers/entries.py` - Entry endpoints
- `apps/api/models.py` - Entry model
- `apps/api/schemas.py` - Entry schemas

### Mobile
- `apps/mobile/src/screens/IncomeScreen.tsx` - Main list
- `apps/mobile/src/screens/AddIncomeScreen.tsx` - Add form
- `apps/mobile/src/screens/EditIncomeScreen.tsx` - Edit form
- `apps/mobile/src/api/entries.ts` - API client
- `apps/mobile/src/navigation/AppNavigator.tsx` - Navigation

---

## 🔧 Common Issues

### Issue: "Network Error"
**Solution:** Check if backend is running on port 8000

### Issue: "401 Unauthorized"
**Solution:** Login again, token may have expired

### Issue: "Can't connect to API"
**Solution:** 
- Check .env file has correct API URL
- If using ngrok, make sure it's running
- Restart Expo with `--clear` flag

### Issue: "Bottom tabs not showing"
**Solution:** Make sure you're logged in

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/entries` | List entries (with filters) |
| GET | `/entries/{id}` | Get single entry |
| POST | `/entries` | Create entry |
| PATCH | `/entries/{id}` | Update entry |
| DELETE | `/entries/{id}` | Delete entry |
| GET | `/entries/stats/totals` | Get totals |

---

## 🎨 UI Components

### IncomeScreen
- Header with totals card
- Scrollable list of entries
- Pull-to-refresh
- Floating action button (FAB)
- Empty state

### AddIncomeScreen
- Amount input (large)
- Date selector (with arrows)
- Note input (optional)
- Save button

### EditIncomeScreen
- Same as Add, but pre-filled
- Update button instead of Save

---

## 💡 Tips

1. **Use "Today" button** for quick date selection
2. **Pull down** to refresh the list
3. **Swipe actions** coming in future updates
4. **Categories** will be added in next phase
5. **Charts** will be added later

---

## 🐛 Debug Mode

### Check Backend Logs
Look at Terminal 1 for API requests and errors

### Check Mobile Logs
Look at Terminal 2 for React Native errors

### Check Network Requests
Use React Native Debugger or Flipper

---

## ✅ Success Criteria

- [ ] Can add income entry
- [ ] Entry appears in list
- [ ] Total updates correctly
- [ ] Can edit entry
- [ ] Can delete entry
- [ ] Pull to refresh works
- [ ] Date picker works
- [ ] No crashes or errors

---

## 📞 Need Help?

Check these files:
1. `MISSION_3_INCOME.md` - Full documentation
2. `README_CURRENT_STATUS.md` - System status
3. Backend logs in Terminal 1
4. Mobile logs in Terminal 2
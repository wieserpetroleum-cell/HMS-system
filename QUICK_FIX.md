# Quick Fix for HMS System

If you're seeing "Loading..." or connection errors, follow these steps:

## Step 1: Clean Everything
```powershell
# Delete node_modules and package-lock
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Reinstall
npm install
```

## Step 2: Clear Vite Cache
```powershell
# Delete .tanstack folder (Vite cache)
Remove-Item -Recurse -Force .tanstack

# Start fresh
npm run dev
```

## Step 3: Hard Refresh Browser
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

## Still not working?

Check browser console (F12) for errors and share them.

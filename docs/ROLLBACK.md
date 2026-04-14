# Rollback Guide - Border-Only Glow Button v3

## Current Production State

**Version:** `v3-border-glow-working`  
**Commit:** `72fb79b`  
**Date:** 2026-04-14  
**Description:** Border-only glow button with cursor-following effect, dark button face, GPU-accelerated animations

---

## Quick Rollback Commands

### Option 1: Rollback via Git Tag (Recommended)
```bash
cd planning-system
git checkout v3-border-glow-working
```

### Option 2: Rollback via Backup Branch 1
```bash
cd planning-system
git checkout backup/v3-border-glow-working-1
```

### Option 3: Rollback via Backup Branch 2
```bash
cd planning-system
git checkout backup/v3-border-glow-working-2
```

### Option 4: Rollback via Commit Hash
```bash
cd planning-system
git reset --hard 72fb79b
```

---

## What This Version Includes

### Core Features
- ✅ Border-only glow effect (face stays dark)
- ✅ Cursor-following glow along border edge
- ✅ GPU-accelerated CSS mask animation
- ✅ 300ms opacity transition on hover
- ✅ Tactile feedback with `active:scale-[0.98]`

### Components
- `src/components/ui/GlowButton.tsx` - Main button component
- `src/hooks/usePointerGlow.ts` - Spatial awareness hook
- `src/styles/index.css` - Global CSS with `.btn-glow` class

### Fixes Applied
- Input occlusion fix (padding-right for Hide button)
- Soft text boundary (mask-image fade)
- Structural tremor fix (reserved error space)
- Tactile state mutations (loading, dimming, "Authenticating..." text)

---

## How to Deploy After Rollback

1. **Checkout the version:**
   ```bash
   git checkout v3-border-glow-working
   ```

2. **Install dependencies (if needed):**
   ```bash
   npm install
   ```

3. **Build:**
   ```bash
   npm run build
   ```

4. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

---

## Git References

| Reference | Type | Command |
|-----------|------|---------|
| `v3-border-glow-working` | Tag | `git checkout v3-border-glow-working` |
| `backup/v3-border-glow-working-1` | Branch | `git checkout backup/v3-border-glow-working-1` |
| `backup/v3-border-glow-working-2` | Branch | `git checkout backup/v3-border-glow-working-2` |
| `72fb79b` | Commit | `git reset --hard 72fb79b` |

---

## Production URLs

- **Production:** https://prios-app.vercel.app
- **Direct Deploy:** https://planning-system-ht2e7bxwv-no0nes-projects-6c1253d4.vercel.app

---

## Notes for Future Developers

This version (`v3-border-glow-working`) was the confirmed working state before major edits. It features:
- Border-only glow (not full-face glow)
- Dark button face that stays dark on hover
- Only the 1px border edge glows with cursor-following effect
- Proper z-index stacking for layers
- Input field soft boundary with mask-image
- Reserved spatial volume for error messages (no layout shift)

If you're reading this, the team was likely testing aggressive changes and needed a safe rollback point.

---

**Created:** 2026-04-14  
**Reason:** TFP protocol testing - preserve working state before wild edits  
**Verified By:** Agent + User collaboration

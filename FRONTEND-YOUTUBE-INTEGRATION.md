# 🚀 Next.js YouTube Integration: Minimal API Flow

## 1️⃣ Step 1: Check YouTube Connection Status (ALWAYS FIRST)

**API:**

```
GET /youtube/oauth/status
```

**Returns:**

- If NOT connected:

```json
{
  "connected": false,
  "channelName": null,
  "channelId": null,
  "message": "YouTube channel not connected"
}
```

- If CONNECTED:

```json
{
  "connected": true,
  "channelName": "Your E-commerce Channel",
  "channelId": "UCxxxxxxxxxxxxx",
  "message": "E-commerce YouTube channel is connected"
}
```

## 2️⃣ Step 2: If NOT connected, start OAuth flow

**API:**

```
GET /youtube/oauth/start
```

- This is a redirect endpoint. Open it in a new tab or set `window.location.href` to it.
- User completes Google OAuth and grants permission.
- After success, backend stores tokens and channel is connected.

## 3️⃣ Step 3: After OAuth, check status again

**API:**

```
GET /youtube/oauth/status
```

- Now you should get `connected: true` and channel info.

## 4️⃣ Step 4: When connected, upload product video

**API:**

```
POST /product-videos
Content-Type: multipart/form-data
```

- Only call this if `/youtube/oauth/status` returns `connected: true`.

---

**Summary:**

- Always call `/youtube/oauth/status` first.
- If not connected, call `/youtube/oauth/start` (redirect user).
- After OAuth, call `/youtube/oauth/status` again.
- If connected, use `/product-videos` to upload.

No router or navigation logic included—just API flow for Next.js or any frontend.

# 📊 Analytics Events - Sample Payloads

## Frontend Events (PostHog)

### 1. open_app
```json
{
  "event": "open_app",
  "properties": {
    "platform": "ios",
    "version": "6.0",
    "timestamp": 1760385000000,
    "$lib": "posthog-js",
    "$lib_version": "1.275.1"
  }
}
```

### 2. onboarding_complete
```json
{
  "event": "onboarding_complete",
  "properties": {
    "steps_completed": 3,
    "timestamp": 1760385000000,
    "$lib": "posthog-js",
    "$lib_version": "1.275.1"
  }
}
```

### 3. create_persona
```json
{
  "event": "create_persona",
  "properties": {
    "origin": "INSPIRED",
    "name": "Алиса",
    "$lib": "posthog-js",
    "$lib_version": "1.275.1"
  }
}
```

### 4. start_chat
```json
{
  "event": "start_chat",
  "properties": {
    "slug": "alice",
    "name": "Алиса",
    "$lib": "posthog-js",
    "$lib_version": "1.275.1"
  }
}
```

### 5. send_message
```json
{
  "event": "send_message",
  "properties": {
    "characterId": "1",
    "characterName": "Алиса",
    "messageLength": 15,
    "$lib": "posthog-js",
    "$lib_version": "1.275.1"
  }
}
```

### 6. purchase_success
```json
{
  "event": "purchase_success",
  "properties": {
    "packId": "small",
    "amount": 300,
    "stars": 300,
    "balance": 1300,
    "$lib": "posthog-js",
    "$lib_version": "1.275.1"
  }
}
```

### 7. quest_complete
```json
{
  "event": "quest_complete",
  "properties": {
    "key": "daily_login",
    "reward": 20,
    "balance": 1020,
    "$lib": "posthog-js",
    "$lib_version": "1.275.1"
  }
}
```

## Backend Logs (Console)

### 1. chat_message
```
📊 [analytics] chat_message: user=123456789, girl=1, msg_length=15
```

### 2. purchase_success
```
📊 [analytics] purchase_success: user=123456789, amount=300, pack=small
```

## Implementation Status

### ✅ Frontend Events
- [x] open_app - App.jsx line 22
- [x] onboarding_complete - Onboarding.jsx line 63
- [x] create_persona - InspiredTab.jsx line 151
- [x] start_chat - Character.jsx line 189
- [x] send_message - ChatScreen.jsx line 110
- [x] purchase_success - Store.jsx line 108
- [x] quest_complete - questTracker.js line 52

### ✅ Backend Logs
- [x] /api/chat/reply → track('chat_message') - api/index.js line 330
- [x] /api/payments/check → track('purchase_success') - api/index.js line 1252
- [x] /api/payments/webhook → track('purchase_success') - api/index.js line 1363

## Setup Instructions

### 1. Enable PostHog
```bash
# Add to .env
VITE_POSTHOG_KEY=phc_your_key_here
VITE_POSTHOG_HOST=https://app.posthog.com
```

### 2. Rebuild Frontend
```bash
cd peach-web
npm run build
```

### 3. Verify Events
1. Open browser dev tools
2. Check console for `📊 event_name` logs
3. Check Network tab for PostHog requests to `https://app.posthog.com/capture/`

## Event Flow

```
User Action → Frontend track() → PostHog API
User Action → Backend API → Console Log
```

## Testing

Run the analytics test script:
```bash
./scripts/test-analytics.sh
```

## Notes

- All events include console logging for debugging
- PostHog events include `$lib` and `$lib_version` automatically
- Backend events are logged to console for monitoring
- Events are sent asynchronously and won't block user actions
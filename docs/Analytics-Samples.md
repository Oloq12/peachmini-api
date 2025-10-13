# Analytics Events - Sample Payloads

## Frontend Events

### 1. open_app
```json
{
  "event": "open_app",
  "properties": {
    "platform": "telegram",
    "version": "7.0",
    "timestamp": 1703123456789
  }
}
```

### 2. onboarding_complete
```json
{
  "event": "onboarding_complete",
  "properties": {
    "steps_completed": 3,
    "timestamp": 1703123456789
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
    "timestamp": 1703123456789
  }
}
```

### 4. start_chat
```json
{
  "event": "start_chat",
  "properties": {
    "slug": "alisa",
    "name": "Алиса",
    "timestamp": 1703123456789
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
    "messageLength": 25,
    "timestamp": 1703123456789
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
    "timestamp": 1703123456789
  }
}
```

### 7. quest_complete
```json
{
  "event": "quest_complete",
  "properties": {
    "key": "create_persona",
    "reward": 50,
    "balance": 1050,
    "timestamp": 1703123456789
  }
}
```

## Backend Events (Console Logs)

### 1. chat_message
```
📊 [analytics] chat_message: user=123456789, girl=1, msg_length=25
```

### 2. purchase_success
```
📊 [analytics] purchase_success: user=123456789, amount=300, pack=small
```

## PostHog Configuration

### Environment Variables
```bash
VITE_POSTHOG_KEY=phc_your_key_here
VITE_POSTHOG_HOST=https://app.posthog.com
```

### Event Properties
- All events include `timestamp` (Unix timestamp)
- User identification via Telegram WebApp initData
- Consistent property naming (camelCase)
- Error handling with fallback to console.log

### Testing
1. Open browser DevTools → Console
2. Look for `📊` prefixed logs
3. Check PostHog dashboard for events
4. Verify user identification works

## Event Flow
1. **App Start**: `open_app` → `quest_complete` (daily_login)
2. **Onboarding**: `onboarding_complete`
3. **Persona Creation**: `create_persona` → `quest_complete`
4. **Chat**: `start_chat` → `send_message` → `quest_complete`
5. **Purchase**: `purchase_success` → `quest_complete`

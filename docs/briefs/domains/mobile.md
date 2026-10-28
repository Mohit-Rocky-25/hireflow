# Mobile Engineering & Cross-Platform Domain Checklist

## 1. Domain Pitfalls & Failure Modes
1. **Performing database**: Performing database queries, image decoding, or heavy JSON parsing on the Main/UI thread causing jank.
2. **Unbounded memory**: Unbounded memory consumption in infinite scrolling lists failing to recycle off-screen native views.
3. **Continuous background**: Continuous background GPS polling causing rapid battery drain (< 3 hours to zero).
4. **Storing sensitive**: Storing sensitive credentials in unencrypted SharedPreferences or AsyncStorage.
5. **Disabling offline**: Disabling offline user interactions with blocking loading spinners.

## 2. Authoritative Reference Sources
- Android Vitals Guidelines (Cold Start Latency, Main-Thread StrictMode, Frame Metrics)
- Apple iOS Human Interface Guidelines & Keychain Services Documentation
- Shopify FlashList Architecture (Native View Recycling in React Native)
- Android WorkManager & Geofencing Client API Documentation

## 3. Mandatory Reviewer Correctness Checks
- [ ] **Check 1:** Verify list components recycle native views and cap memory consumption below 200MB native RAM.
- [ ] **Check 2:** Assert that mobile chat and note engines implement optimistic UI with offline SQLite persistence.
- [ ] **Check 3:** Check that background location engines utilize hardware geofencing to maintain < 2.5% 12h battery drain.
- [ ] **Check 4:** Confirm that sensitive tokens use hardware-backed keychains (Android Keystore / Apple Secure Enclave).

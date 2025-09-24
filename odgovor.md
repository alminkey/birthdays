- U najnovijim verzijama Android Studija “Toggle Offline Mode” nije više u Gradle Tool Window-u, nego u postavkama.

**Kako uključiti offline mod**
1. Otvori `File > Settings > Build, Execution, Deployment > Gradle` (na macOS: `Android Studio > Preferences`).
2. U sekciji *Gradle* označi opciju “Offline work”.
3. Klikni `OK`, pa ručno pokreni `File > Sync Project with Gradle Files`.

**Dodatni savjeti**
- Provjeri donji desni ugao: ikona Gradle sa oznakom “Offline” potvrđuje da je mod aktiviran.
- Ako gradiš iz terminala, koristi `./gradlew assembleRelease --offline` da obavezno koristi lokalne artefakte.

Kada je “Offline work” aktivan, sync i build koriste lokalni `gradle-8.10.1-all.zip` bez pokušaja spajanja na `services.gradle.org`.

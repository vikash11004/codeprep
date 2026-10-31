# Runner dependencies

`npm run setup` downloads nlohmann/json 3.12.0 (MIT) and Gson 2.13.2 (Apache-2.0) from their upstream release repositories. The downloaded files are ignored by Git. Preserve their embedded licenses when redistributing.

Windows: `npm run setup:compilers` additionally installs WinLibs GCC (GPL with runtime exception) and Eclipse Temurin JDK 21 (GPL with Classpath exception) under `.tools`, without modifying the system PATH. The JDK checksum and the GCC release digest, when provided upstream, are verified.

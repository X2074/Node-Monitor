# Changelog

All notable changes to this project will be documented in this file.

---

### [Unreleased]

#### 🚧 Work in Progress
- Stability testing and performance validation for TypeScript-based monitoring core
- Additional alert types and restart strategy refinements under evaluation

---

### [v1.0.0] - 2025-05-17

#### ✨ Features

- **Migrated project from JavaScript to TypeScript**
    - Fully refactored the entire codebase from JavaScript to TypeScript, ensuring strong typing and better IDE support
    - Applied type annotations to all major interfaces, service functions, database operations, and configuration modules
    - Introduced `AppConfig` interface for structured environment configuration management
    - Rewrote core logic modules including:
        - Node status collection and RPC communication (typed JSON-RPC request/response)
        - Block height synchronization and lag detection
        - Auto-restart mechanism and system command execution
        - Email notification system with template-based alerting
        - Alert deduplication logic using hashed payload comparison
        - SQLite-based logging and alert recorders
    - Enhanced error handling by leveraging TypeScript's type narrowing and try/catch consistency
    - Refactored logger and scheduling modules to support clearer runtime diagnostics

 


# Supabase PostgreSQL Setup Guide for Healix HMS

This document provides step-by-step instructions to configure and connect the existing **Healix Hospital Management System** to **Supabase PostgreSQL**.

---

## Architecture Overview

```
Browser
  ↓
Existing Frontend (Thymeleaf / CSS)
  ↓
Existing Java / Spring Boot Backend (Port 8080)
  ↓
Existing Services & JPA Repositories
  ↓
JPA / Hibernate (PostgreSQLDialect)
  ↓
Supabase PostgreSQL (Port 5432 / 6543)
```

---

## Step 1: Create a Supabase Project

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New project** and select your organization.
3. Enter project details:
   - **Name**: `healix-hms` (or your preferred name)
   - **Database Password**: Set a strong, secure password (save it safely).
   - **Region**: Choose the region closest to you (e.g., `South Asia (Mumbai)` / `ap-south-1`).
4. Click **Create new project** and wait ~1–2 minutes for provisioning to complete.

---

## Step 2: Open Database Connection Settings

1. In your project dashboard, navigate to **Project Settings** (gear icon in the bottom-left sidebar).
2. Under the **Configuration** menu, click **Database**.
3. Scroll to the **Connection parameters** / **Connection string** section.

---

## Step 3: Obtain PostgreSQL Connection Details

Select the **JDBC** tab or **URI** tab:

### Option A: Connection Pooler (Recommended)
- Supports IPv4 and IPv6 networks without extra configuration.
- **Session Mode (Port 5432)**: Recommended for Spring Boot JPA/Hibernate.
  - Host: `aws-0-<REGION>.pooler.supabase.com`
  - Port: `5432`
  - Database: `postgres`
  - User: `postgres.<PROJECT_REF>`
  - JDBC URL:
    ```
    jdbc:postgresql://aws-0-<REGION>.pooler.supabase.com:5432/postgres?sslmode=require
    ```

### Option B: Direct Connection
- Connects directly to PostgreSQL (requires IPv6 connectivity or Supabase IPv4 add-on).
  - Host: `db.<PROJECT_REF>.supabase.co`
  - Port: `5432`
  - Database: `postgres`
  - User: `postgres`
  - JDBC URL:
    ```
    jdbc:postgresql://db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require
    ```

---

## Step 4: Set the Required Environment Variables

Set the environment variables in your operating system terminal, or copy `.env.example` to `.env`:

### Using a local `.env` file (Automatic in development):
Copy `.env.example` to `.env` in `Backend/healix-backend/.env` or the project root:
```env
SUPABASE_DB_URL=jdbc:postgresql://aws-0-<REGION>.pooler.supabase.com:5432/postgres?sslmode=require
SUPABASE_DB_USERNAME=postgres.<PROJECT_REF>
SUPABASE_DB_PASSWORD=<YOUR_DATABASE_PASSWORD>
SUPABASE_DB_DRIVER=org.postgresql.Driver
```

*(Note: `.env` is included in `.gitignore` to prevent credentials from being committed to Git.)*

### Or export in your shell:
#### Windows (PowerShell):
```powershell
$env:SUPABASE_DB_URL="jdbc:postgresql://aws-0-<REGION>.pooler.supabase.com:5432/postgres?sslmode=require"
$env:SUPABASE_DB_USERNAME="postgres.<PROJECT_REF>"
$env:SUPABASE_DB_PASSWORD="<YOUR_DATABASE_PASSWORD>"
```

#### Linux / macOS (Bash / Zsh):
```bash
export SUPABASE_DB_URL="jdbc:postgresql://aws-0-<REGION>.pooler.supabase.com:5432/postgres?sslmode=require"
export SUPABASE_DB_USERNAME="postgres.<PROJECT_REF>"
export SUPABASE_DB_PASSWORD="<YOUR_DATABASE_PASSWORD>"
```

---

## Step 5: Database Migration and Schema

The application is pre-configured with two automated migration options:

### Method 1: Automatic Spring Boot Initialization (Default)
When the Spring Boot application starts, it automatically executes:
1. `src/main/resources/schema.sql` (Creates all tables, constraints, foreign keys, and indexes)
2. `src/main/resources/data.sql` (Seeds demo hospitals, departments, default admin, doctors, patients, and syncs PostgreSQL sequences)

This behavior is enabled via:
```properties
spring.sql.init.mode=always
spring.jpa.defer-datasource-initialization=true
```

### Method 2: Manual Supabase SQL Editor
If preferred, you can run the schema manually:
1. In your Supabase Dashboard, open the **SQL Editor** from the left navigation.
2. Click **New query**.
3. Copy and paste the contents of `src/main/resources/db/migration/V1__schema.sql` and click **Run**.
4. Copy and paste the contents of `src/main/resources/db/migration/V2__seed_data.sql` and click **Run**.

---

## Step 6: Start the Spring Boot Application

Navigate to the backend directory and launch the application:

```bash
cd Backend/healix-backend
mvn spring-boot:run
```

Or on Windows with Maven wrapper/installed Maven:
```powershell
& "C:\Tools\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run
```

---

## Step 7: Verify the Connection

1. **Check startup logs:**
   Look for successful HikariCP pool connection and initialization:
   ```
   HikariPool-1 - Added connection conn0: url=jdbc:postgresql://... user=...
   HikariPool-1 - Start completed.
   Initialized JPA EntityManagerFactory for persistence unit 'default'
   ==============================================
     Healix Hospital Management System Started
     Database: Supabase PostgreSQL
     URL: http://localhost:8080
   ==============================================
   ```

2. **Open the web application:**
   Navigate to [http://localhost:8080](http://localhost:8080) in your web browser.

3. **Log in with seeded demo accounts:**
   - **Platform Super Admin**: `admin@healix.com` / `Admin@123`
   - **Hospital Admin**: `admin.medicare@healix.com` / `Admin@123`
   - **Doctor**: `doctor@healix.com` / `Doctor@123`
   - **Patient**: `patient@healix.com` / `Patient@123`

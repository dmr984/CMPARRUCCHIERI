# Build Project Workflow

This workflow details the steps required to install dependencies and build the Next.js application.

## 1. Environment Preparation (Windows)

If you are running commands on Windows using PowerShell and encounter execution errors (e.g., `npm` is not recognized or script execution is disabled), ensure Node.js is installed and run the following in your shell session to update environment variables and bypass PowerShell script blocking:

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## 2. Install Dependencies

Install the required project dependencies. Using `npm.cmd` avoids PowerShell script execution blockages:

```powershell
npm.cmd install
```

## 3. Typecheck the Code

Ensure there are no TypeScript compile-time errors:

```powershell
npm.cmd run typecheck
```

## 4. Build the Web Application

Generate the production-ready bundle of the Next.js application:

```powershell
npm.cmd run build
```

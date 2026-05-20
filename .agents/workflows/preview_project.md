# Preview Project Workflow

This workflow details the steps required to start the local Next.js development server and preview the application.

## 1. Environment Preparation (Windows)

Ensure Node.js is installed and load it in your active PowerShell session:

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## 2. Start the Development Server

Run the development server. By default, it is configured in `package.json` to run on port `9002`:

```powershell
npm.cmd run dev
```

The output will display the localhost URL:
- Local URL: [http://localhost:9002](http://localhost:9002)

## 3. Verify the Preview

Open [http://localhost:9002](http://localhost:9002) in your browser and check if the application renders correctly.

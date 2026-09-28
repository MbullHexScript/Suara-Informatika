@echo off
pushd "%~dp0"
node scripts/ops.mjs diagnose
set RESULT=%ERRORLEVEL%
popd
exit /b %RESULT%

@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist build.mjs cd /d "%~dp0..\.."
echo.
echo  Mikdash tests: the game plays itself. Do not close this window.
echo  הבדיקה רצה. לא לסגור את החלון הזה עד שכתוב DONE.
echo.
git pull --ff-only
if errorlevel 1 echo  git pull failed, running the version that is here
node build.mjs
if errorlevel 1 goto bad
node tools\pc\run.cjs
echo.
echo  DONE. אפשר לסגור את החלון.
pause
exit /b 0
:bad
echo  BUILD FAILED. תכתוב לי שהבנייה נכשלה.
pause

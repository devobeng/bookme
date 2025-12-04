@echo off
echo Deleting JavaScript files...

REM Delete all .js files in src directory
for /r "g:\2025\bookme\backend\src" %%f in (*.js) do (
    echo Deleting %%f
    del "%%f"
)

REM Delete all .js files in tests directory
for /r "g:\2025\bookme\backend\tests" %%f in (*.js) do (
    echo Deleting %%f
    del "%%f"
)

echo Done!

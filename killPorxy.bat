@echo OFF

if exist pid.txt (
    for /f %%x in (pid.txt) do taskkill /f /fi "pid eq %%x" /fi "imagename eq node.exe"
)
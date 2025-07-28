@echo off
chcp 65001 >nul
echo ========================================
echo   AI提示词模板库 - 启动脚本
echo ========================================
echo.

echo 选择启动方式：
echo 1. 直接用浏览器打开（推荐，无需服务器）
echo 2. 尝试启动Python服务器
echo 3. 尝试启动Node.js服务器
echo 4. 查看帮助信息
echo.
set /p choice=请输入选择 (1-4):

if "%choice%"=="1" goto browser
if "%choice%"=="2" goto python
if "%choice%"=="3" goto nodejs
if "%choice%"=="4" goto help
goto browser

:browser
echo.
echo 正在用默认浏览器打开项目...
start "" "index.html"
echo.
echo 项目已在浏览器中打开！
echo 如果遇到数据加载问题，这是正常的，项目会自动使用内置数据。
pause
exit /b 0

:python
echo.
echo 正在检查Python环境...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到Python环境
    echo 请选择其他启动方式或安装Python
    pause
    exit /b 1
)
echo Python环境检查通过！
echo 正在启动服务器... 访问地址: http://localhost:8000
python -m http.server 8000
pause
exit /b 0

:nodejs
echo.
echo 正在检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到Node.js环境
    echo 请选择其他启动方式或安装Node.js
    pause
    exit /b 1
)
echo Node.js环境检查通过！
echo 正在启动服务器... 访问地址: http://localhost:3000
npx serve . -p 3000
pause
exit /b 0

:help
echo.
echo ========================================
echo              帮助信息
echo ========================================
echo.
echo 推荐使用方式1（直接浏览器打开）：
echo - 最简单，无需安装任何软件
echo - 项目已优化支持直接打开
echo - 会自动使用内置的示例数据
echo.
echo 如果需要完整功能，建议：
echo 1. 安装Python: https://python.org
echo 2. 或安装Node.js: https://nodejs.org
echo.
echo 故障排除：
echo - 如果浏览器显示空白，请检查文件是否完整
echo - 如果显示"数据加载失败"，这是正常的，会自动切换到内置数据
echo - 确保所有文件都在同一个文件夹中
echo.
pause
exit /b 0

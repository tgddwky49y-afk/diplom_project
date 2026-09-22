# Учебный планировщик

Система планирования учебных задач и контроля дедлайнов. Текущий этап: первые две недели — структура приложения, база данных и CRUD задач.

## Стек

- Клиент: React, TypeScript, HTML и CSS.
- Сервер: C#, ASP.NET Core Web API с контроллерами.
- База: Microsoft SQL Server, доступ через Entity Framework Core.
- Vite собирает клиент. Node.js используется только для инструментов фронтенда, не как сервер приложения.

Контроллеры и модели используют инфраструктуру ASP.NET Core MVC, но сервер возвращает JSON, а интерфейс рисует React. Это клиент-серверное приложение, а не MVC с Razor-представлениями.

## Что работает

Создание, список, просмотр по ID, редактирование и удаление задач; срок, приоритет, статус и прогресс. На сервере проверяются данные. На клиенте отображаются ошибки и блокируются повторные нажатия при сохранении.

Пользователи и проекты пока представлены таблицами и связями. Регистрация, вход, управление проектами, календарь и напоминания — следующие этапы, они ещё не реализованы. Сейчас это локальная однопользовательская учебная версия: не публикуйте её в интернете без авторизации.

## Что установить на Windows

1. .NET 10 SDK (для Visual Studio — нагрузку «ASP.NET и разработка веб-приложений»).
2. SQL Server Express LocalDB. Обычный SQL Server Express тоже подходит, но понадобится другая строка подключения.
3. Node.js 22.12+ или 24 для сборки React.
4. Visual Studio или VS Code — на выбор.

## Запуск на Windows

Распакуйте проект. Все следующие команды выполняются из его корневой папки.

Проверьте LocalDB:

```powershell
sqllocaldb info MSSQLLocalDB
sqllocaldb start MSSQLLocalDB
```

Если экземпляр не существует, после установки LocalDB выполните `sqllocaldb create MSSQLLocalDB`, затем запустите его.

Подготовьте сервер и базу:

```powershell
dotnet restore StudyPlanner.sln
dotnet run --project server/StudyPlanner.Api -- --migrate
dotnet run --project server/StudyPlanner.Api
```

Миграция создаёт базу StudyPlanner и таблицы. Повторный запуск применяет только ещё не выполненные миграции и не удаляет данные. Сервер работает на http://localhost:5080. Проверка: http://localhost:5080/api/health.

Откройте второй терминал в корне проекта:

```powershell
cd client
npm ci
npm run dev
```

Откройте http://localhost:5173. Vite перенаправляет запросы /api на ASP.NET Core — настройка CORS для этого локального режима не нужна.

## Если используется не LocalDB

Из корня задайте строку подключения через секреты разработчика:

```powershell
dotnet user-secrets set "ConnectionStrings:Planner" "Server=localhost\\SQLEXPRESS;Database=StudyPlanner;Trusted_Connection=True;TrustServerCertificate=True" --project server/StudyPlanner.Api
```

Не записывайте настоящие пароли в GitHub. LocalDB работает только на Windows. На Linux нужен отдельный SQL Server и строка подключения через переменную `ConnectionStrings__Planner`. Параметр TrustServerCertificate предназначен для локальной разработки; в публичной среде настройте доверенный сертификат.

## Проверка

```powershell
dotnet build StudyPlanner.sln
dotnet run --project tests/StudyPlanner.Checks
npm --prefix client run build
```

Для полного теста с настоящим SQL Server сначала примените миграцию и запустите сервер, затем:

```powershell
node tests/api-smoke.mjs
```

Тест создаёт отдельную временную задачу, проверяет чтение, изменение, ошибки валидации и удаление. Он не удаляет другие задачи.

## Миграции и файлы

```powershell
dotnet tool restore
dotnet ef migrations list --project server/StudyPlanner.Api
```

- `StudyPlanner.sln` — решение для Visual Studio.
- `server/StudyPlanner.Api/Controllers` — HTTP-запросы.
- `Models` — сущности; `Data` — DbContext и связи.
- `Contracts` — входные данные и правила проверки.
- `Migrations` — версия структуры SQL Server.
- `client/src` — React-интерфейс.
- `docs/database.md` — схема таблиц.
- `docs/defense.md` — объяснение кода.

Предыдущая реализация сервера Node.js и PostgreSQL удалена из текущих файлов. Её можно восстановить из истории Git. Перенос старых пользовательских данных из PostgreSQL не выполняется автоматически.


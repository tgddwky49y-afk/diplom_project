# Схема базы данных

```mermaid
erDiagram
    USERS o|--o{ PROJECTS : owns
    PROJECTS o|--o{ TASKS : contains
    USERS {
        int Id PK
        string Name
        string Email UK
    }
    PROJECTS {
        int Id PK
        int OwnerId FK
        string Title
        string Description
    }
    TASKS {
        int Id PK
        int ProjectId FK
        string Title
        string Description
        date DueDate
        string Priority
        string Status
        int Progress
        datetime CreatedAt
        datetime UpdatedAt
    }
```

OwnerId и ProjectId пока необязательны: CRUD задач работает без регистрации и проекта.
Удаление связанного пользователя или проекта запрещено, пока существуют ссылающиеся записи.
Приоритет: low, medium, high. Статус: todo, in_progress, completed.
Прогресс — целое число 0–100. API принимает 100 только для completed, и требует 100 при completed.
Title ограничен 150 символами, Description у задачи — 2000.
DueDate хранится как SQL date без часового пояса, CreatedAt и UpdatedAt — время UTC.
Идентификаторы генерирует SQL Server (IDENTITY). Email уникален.
Структура создаётся миграцией EF Core, а не при каждом запуске сервера.


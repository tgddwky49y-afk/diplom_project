# База данных

На второй неделе подготовлены три основные сущности: пользователь, проект и задача.

```mermaid
erDiagram
  USERS ||--o{ PROJECTS : creates
  PROJECTS ||--o{ TASKS : contains

  USERS {
    bigint id PK
    varchar name
    varchar email
    text password_hash
  }

  PROJECTS {
    bigint id PK
    bigint owner_id FK
    varchar title
    text description
  }

  TASKS {
    bigint id PK
    bigint project_id FK
    varchar title
    text description
    date due_date
    varchar priority
    varchar status
    integer progress
  }
```

На этом этапе CRUD реализован для задач. Поля `project_id` и `owner_id` пригодятся на следующих этапах, когда появятся проекты и авторизация.


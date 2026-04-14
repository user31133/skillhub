# Login Password:  admin@skillhub.com password123

# Figma 
https://www.figma.com/design/vFub3BZpaCE2b1bFwmi8IL/Untitled?node-id=0-1&t=qLDmkI2L8kstsHnT-1


# SkillHub — AI Agent Skills Marketplace

Full-stack SPA: каталог AI-агентских навыков с аутентификацией, ролями, CRUD, избранным и админ-панелью.

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui
- **Backend**: FastAPI, SQLAlchemy 2.0 async, SQLite, JWT, Alembic
- **Deploy**: Render (`render.yaml`), Docker Compose для локальной разработки

## Стек и соответствие требованиям

### Страницы (11, минимум 8)
| Маршрут | Описание |
|---|---|
| `/` | Главная |
| `/login` | Вход |
| `/register` | Регистрация |
| `/dashboard` | Dashboard |
| `/skills` | Список навыков (поиск/фильтр/сортировка/пагинация + таб Saved) |
| `/skills/[id]` | Детали навыка (динамический маршрут) |
| `/skills/create` | Создание |
| `/skills/[id]/edit` | Редактирование |
| `/skills/mine` | Мои навыки |
| `/profile` | Профиль |
| `/admin` | Админ-панель |
| `/users/[id]` | Публичный профиль автора |
| `*` | 404 (`not-found.tsx`) |

### Маршрутизация
- Базовые и динамические маршруты (`/skills/[id]`, `/users/[id]`)
- Защищённые маршруты через `components/layout/protected-route.tsx`
- Редирект после входа на `/dashboard`
- 404-страница

### Авторизация
- Регистрация и вход (JWT)
- Токен в `localStorage`, сессия через `context/auth-context.tsx`
- Роли: `admin` / `user` (enum `UserRole` на backend)
- Owner-логика: Edit/Delete видны только владельцу и админу
- Logout, смена UI по статусу пользователя

### CRUD
- Список навыков с пагинацией
- Загрузка одного элемента по `id`
- Создание, редактирование, удаление
- Сохранение в избранное (`saved_skills` + таб `/skills?tab=saved`)

### Формы
- Login, Register, Create/Edit Skill, Profile
- Controlled inputs, валидация, сообщения об ошибках, отправка без перезагрузки

### Поиск / фильтрация / сортировка
- Поиск `?q=`
- Фильтры: `category`, `framework`
- Сортировка: `newest`, популярность и т.д.
- Пагинация `?page=`
- Состояние синхронизировано с URL (shareable links)

### UI-состояния
Loading, empty, error, success (toasts), подтверждение удаления — на всех страницах списков/деталей.

### Сохранение данных
- JWT-токен в `localStorage`
- URL-state для фильтров и вкладок

## Структура проекта

```
skillhub/
├── frontend/
│   └── src/
│       ├── app/                    # Next.js App Router
│       │   ├── (auth)/             # login, register
│       │   ├── (dashboard)/        # dashboard, skills, profile, admin, users
│       │   ├── not-found.tsx       # 404
│       │   └── layout.tsx
│       ├── components/
│       │   ├── ui/                 # shadcn/21st.dev (не трогаем)
│       │   └── layout/             # адаптированные (protected-route, navbar…)
│       ├── services/               # API-слой (skills.ts, admin.ts, auth.ts)
│       ├── context/                # auth-context
│       └── hooks/
├── backend/
│   ├── main.py                     # FastAPI app
│   ├── models.py                   # SQLAlchemy модели (User, Skill, SavedSkill…)
│   ├── schemas.py                  # Pydantic v2
│   ├── routes/                     # skills.py, admin.py, auth, users
│   ├── auth.py                     # JWT + get_current_user
│   ├── alembic/versions/           # миграции
│   └── seed.py
├── docker-compose.yml
└── render.yaml
```

## Запуск

### Локально
```bash
# Backend
cd backend
uvicorn main:app --reload           # http://localhost:8000
python seed.py                      # заполнить БД
alembic upgrade head                # применить миграции

# Frontend
cd frontend
npm install
npm run dev                         # http://localhost:3000
```

### Docker
```bash
docker compose up --build -d        # backend на порту 9001
docker compose logs -f backend
docker compose down -v              # сброс БД
```

### Production build
```bash
cd frontend && npm run build && npm start
```

## Миграции БД

```bash
cd backend
alembic revision --autogenerate -m "описание"
alembic upgrade head
```

Никаких ручных правок БД — только через Alembic.

## Роли и owner-логика

- `user` — создаёт/редактирует/удаляет свои навыки, сохраняет в избранное
- `admin` — доступ к `/admin`, может модерировать любые навыки
- Проверки enforced на backend в `routes/skills.py` и `routes/admin.py`

## Деплой

Проект опубликован на Render (конфиг в `render.yaml`): отдельные сервисы для frontend и backend. Маршруты работают корректно после публикации (App Router + SPA-роутинг).

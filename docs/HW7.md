# GraphQL для Orders + DataLoader

## Підхід до Schema

**Обрано: Code-first**

Причини:
- Консистентність з TypeORM - декоратори використовуються скрізь в проєкті
- TypeScript типи генеруються автоматично
- Легше рефакторити - зміни в одному місці
- IDE автокомпліт працює з коробки

Schema генерується автоматично в `src/schema.gql`.

### Nullability

Осмислена nullability — кожне рішення має бізнес-обґрунтування:

| Поле | Nullable? | Причина |
|------|-----------|---------|
| `id`, `status`, `createdAt` | Ні | Завжди існують |
| `items` | Ні | Завжди масив (може бути пустий) |
| `product` | Так | Продукт міг бути видалений |
| `user` | Так | Користувач міг бути видалений |
| `nextCursor` | Так | Немає наступної сторінки |
| `phone` | Так | Не обов'язкове поле |

---

### Формат відповіді

Обрано спрощену cursor-based пагінацію:

- Cursor pagination вже реалізована (keyset)
- `nextCursor` достатньо для infinite scroll
- Повну специфікацію планую додати пізніше

---

## DataLoader та N+1

### Проблема N+1

При запиті з nested `product` та `user`:

```graphql
query {
  userOrders(userId: "...") {
    orders {
      user { name }
      items {
        product { name }
      }
    }
  }
}
```

**Без DataLoader:**
- 1 запит на User (перевірка існування)
- 2 запити на Orders (DISTINCT + основний з JOIN items)
- **20 запитів на Products** (по одному на кожен OrderItem)
- **20 запитів на Users** (по одному на кожен Order)
- **Всього: 43 SQL запити**

### Рішення: Централізований LoadersFactory

### Результат

**З DataLoader:**
- 1 запит на User (перевірка)
- 2 запити на Orders
- **1 запит на Products** (`WHERE id IN (...)`)
- **1 запит на Users** (`WHERE id IN (...)`)
- **Всього: 5 SQL запитів**

### Як перевіряв N+1

1. Увімкнув логування SQL: `logging: ['query']` в TypeORM config
2. Виконати запит з nested product та user
3. Порахувати SQL запити в консолі до використання loader та після

---

## Error Handling

### Підхід

Використовуємо ті самі `AppException` що і в REST, але трансформуємо через `formatError`:

### Приклад помилки

```json
{
  "errors": [
    {
      "message": "Order with ID '123' was not found",
      "extensions": {
        "code": "https://groceryflow.dev/errors/not-found",
        "title": "Resource Not Found",
        "status": 404,
        "stacktrace": ["..."]
      }
    }
  ],
  "data": {
    "order": null
  }
}
```
## Приклади запитів

### Список замовлень користувача

```graphql
query GetUserOrders($userId: ID!) {
  userOrders(userId: $userId) {
    orders {
      id
      status
      totalCents
      createdAt
    }
    nextCursor
  }
}
```

### З фільтрами та пагінацією

```graphql
query GetPendingOrders($userId: ID!) {
  userOrders(
    userId: $userId
    filter: { status: PENDING, dateFrom: "2025-01-01T00:00:00Z" }
    pagination: { limit: 10 }
  ) {
    orders {
      id
      status
      totalCents
      user {
        name
        email
      }
      items {
        quantity
        productNameSnapshot
        product {
          id
          name
          priceCents
        }
      }
    }
    nextCursor
  }
}
```

### Наступна сторінка (cursor pagination)

```graphql
query GetNextPage($userId: ID!, $cursor: String!) {
  userOrders(
    userId: $userId
    pagination: { limit: 10, cursor: $cursor }
  ) {
    orders {
      id
      status
    }
    nextCursor
  }
}
```

### Один order з деталями

```graphql
query GetOrder($id: ID!) {
  order(id: $id) {
    id
    status
    totalCents
    createdAt
    user {
      id
      name
      email
    }
    items {
      id
      quantity
      priceCentsSnapshot
      productNameSnapshot
      product {
        id
        name
        priceCents
        stock
      }
    }
  }
}
```

---

## Запуск та тестування

```bash
# Запустити сервер
pnpm start:dev

# Відкрити GraphiQL
open http://localhost:3001/graphql

# Перевірити schema
cat src/schema.gql
```

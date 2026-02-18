# Робота з файлами та AWS S3

## Інтегровані домени

- **Products** — main image (`POST /products/:id/images`)
- **Users** — avatar (`POST /users/avatar`)

Архітектура підтримує також **Farms** (logo + gallery фото) — entity підготовлені, attach endpoints будуть додані з CRUD.

## Архітектура

```
infrastructure/storage/          — S3/MinIO обгортка (StorageService)
modules/files/                   — бізнес-логіка файлів (FileRecord, presign/complete flow)
modules/products/                — attach main image
modules/users/                   — attach avatar
```

`StorageModule` ізольований від бізнес-логіки — знає тільки про S3 API.  
`FilesModule` імпортує `StorageModule` і працює з `FileRecord`, ownership, permissions.  
Domain модулі (Products, Users) імпортують `FilesModule` для attach операцій.

## Presign → Upload → Complete flow

### 1. Presign — `POST /files/presign`

Клієнт передає `entityType`, `kind`, `contentType`, `sizeBytes`.  
Бекенд:
- Валідує комбінацію `entityType + kind` (типізований map)
- Валідує `contentType` (тільки image/jpeg, image/png, image/webp)
- Перевіряє role-based upload permissions
- Генерує `objectKey` на бекенді (клієнт не може передати свій key)
- Створює `FileRecord` зі статусом `pending`
- Повертає `uploadUrl` (presigned PUT URL) з TTL 900 сек

### 2. Upload — клієнт → S3

Клієнт робить `PUT uploadUrl` напряму в S3/MinIO.  
Бекенд не приймає файл через себе.

### 3. Complete — `POST /files/complete`

Клієнт передає `fileId`.  
Бекенд:
- Перевіряє ownership (файл належить поточному юзеру)
- Перевіряє що файл реально існує в S3 через `HeadObjectCommand`
- Оновлює `sizeBytes` реальним значенням з S3 metadata
- Переводить статус `pending → ready`

### 4. Attach — domain endpoint

- `POST /products/:id/images` — прив'язує файл до продукту (farmer: тільки свої, admin: будь-які)
- `POST /users/avatar` — прив'язує файл як аватар поточного юзера

## Перевірки доступу

### Role-based upload permissions

| Entity Type | Дозволені ролі           |
|-------------|--------------------------|
| `user`      | customer, farmer, admin, support |
| `product`   | farmer, admin            |
| `farm`      | farmer, admin            |

### Ownership checks

- **Presign** — role validation (чи має право завантажувати цей тип)
- **Complete** — ownership (тільки власник файлу)
- **Attach product image** — farmer перевіряється на належність продукту до його ферми
- **Attach avatar** — `userId` з JWT токена, змінює тільки свій


## URL для перегляду

Два режими (визначається автоматично через конфіг):

1. **CloudFront (production)** — `CLOUDFRONT_BASE_URL/{objectKey}` — синхронний, кешований
2. **Presigned GET (dev)** — генерується через AWS SDK, TTL 1 година

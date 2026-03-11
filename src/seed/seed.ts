import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Farm } from '@modules/farms/entities/farm.entity';
import { Category } from '@modules/categories/entities/category.entity';
import * as argon2 from 'argon2';
import {
  Product,
  ProductUnit,
} from '@modules/products/entities/product.entity';
import { User, UserRole } from '@modules/users/entities/user.entity';

const DEFAULT_PASSWORD = 'Test123!@#';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity{.ts,.js}'],
});

async function seed() {
  await AppDataSource.initialize();
  console.log('🌱 Seeding started...\n');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // ==========================================
    // CLEANUP
    // ==========================================
    await queryRunner.query(
      'TRUNCATE "users", "orders", "order_fulfillments", "order_items", "products", "categories", "farms", "files", "refresh_tokens" CASCADE',
    );
    await queryRunner.query(
      'TRUNCATE "users", "orders", "products", "categories", "farms", "files", "refresh_tokens" CASCADE',
    );
    console.log('🧹 Tables truncated');
    // ==========================================
    // PASSWORD HASH
    // ==========================================
    const passwordHash = await argon2.hash(DEFAULT_PASSWORD);
    console.log(`🔑 Password for all users: ${DEFAULT_PASSWORD}`);
    // ==========================================
    // FARMS
    // ==========================================
    const farmRepo = queryRunner.manager.getRepository(Farm);

    const farms = await farmRepo.save([
      {
        name: 'Еко-ферма Сонячна',
        slug: 'eco-ferma-sonyachna',
        description:
          'Сімейна ферма, 50 корів, без антибіотиків. Молочна продукція та овочі.',
        location: 'Київська обл., с. Петрівка',
        isOrganicCertified: true,
        isActive: true,
        rating: 4.8,
        totalReviews: 124,
      },
      {
        name: 'Ферма Зелений Гай',
        slug: 'ferma-zelenyi-hai',
        description:
          'Органічні овочі та фрукти. Сертифіковане біо-господарство.',
        location: 'Вінницька обл., с. Зелений Гай',
        isOrganicCertified: true,
        isActive: true,
        rating: 4.5,
        totalReviews: 87,
      },
      {
        name: 'Пасіка Медова Долина',
        slug: 'pasika-medova-dolyna',
        description: 'Натуральний мед з Карпат. 200 бджолосімей.',
        location: 'Івано-Франківська обл., с. Медова Долина',
        isOrganicCertified: false,
        isActive: true,
        rating: 4.9,
        totalReviews: 203,
      },
      {
        name: 'Хутір Козацький',
        slug: 'khutir-kozatskyi',
        description: "М'ясо та ковбаси домашнього виробництва.",
        location: 'Полтавська обл., с. Козацьке',
        isOrganicCertified: false,
        isActive: true,
        rating: 4.3,
        totalReviews: 56,
      },
    ]);

    console.log(`✅ Farms: ${farms.length} created`);

    // ==========================================
    // CATEGORIES
    // ==========================================
    const catRepo = queryRunner.manager.getRepository(Category);

    // Root categories
    const dairy = await catRepo.save({
      name: 'Молочка',
      slug: 'dairy',
      sortOrder: 1,
      isActive: true,
    });

    const vegetables = await catRepo.save({
      name: 'Овочі',
      slug: 'vegetables',
      sortOrder: 2,
      isActive: true,
    });

    const fruits = await catRepo.save({
      name: 'Фрукти',
      slug: 'fruits',
      sortOrder: 3,
      isActive: true,
    });

    const meat = await catRepo.save({
      name: "М'ясо та ковбаси",
      slug: 'meat',
      sortOrder: 4,
      isActive: true,
    });

    const honey = await catRepo.save({
      name: 'Мед',
      slug: 'honey',
      sortOrder: 5,
      isActive: true,
    });

    const eggs = await catRepo.save({
      name: 'Яйця',
      slug: 'eggs',
      sortOrder: 6,
      isActive: true,
    });

    // Subcategories
    const cheese = await catRepo.save({
      name: 'Сир',
      slug: 'cheese',
      parentId: dairy.id,
      sortOrder: 1,
      isActive: true,
    });

    const milk = await catRepo.save({
      name: 'Молоко',
      slug: 'milk',
      parentId: dairy.id,
      sortOrder: 2,
      isActive: true,
    });

    const sourCream = await catRepo.save({
      name: 'Сметана та йогурт',
      slug: 'sour-cream-yogurt',
      parentId: dairy.id,
      sortOrder: 3,
      isActive: true,
    });

    console.log(`✅ Categories: 9 created (6 root + 3 sub)`);

    // ==========================================
    // PRODUCTS
    // ==========================================
    const productRepo = queryRunner.manager.getRepository(Product);

    const products = await productRepo.save([
      // Ферма Сонячна — молочка
      {
        farmId: farms[0].id,
        categoryId: milk.id,
        sku: 'SUN-MILK-32',
        name: "Молоко коров'яче 3.2%",
        description: 'Свіже непастеризоване молоко від корів вільного випасу.',
        priceCents: 4500,
        stock: 50,
        unit: ProductUnit.L,
        isOrganic: true,
        isActive: true,
      },
      {
        farmId: farms[0].id,
        categoryId: cheese.id,
        sku: 'SUN-CHEESE-HOME',
        name: 'Сир домашній кисломолочний',
        description: 'Ніжний домашній сир з цільного молока.',
        priceCents: 18900,
        stock: 25,
        unit: ProductUnit.KG,
        isOrganic: true,
        isActive: true,
      },
      {
        farmId: farms[0].id,
        categoryId: sourCream.id,
        sku: 'SUN-SMETANA-20',
        name: 'Сметана 20%',
        description: 'Густа сметана домашнього виробництва.',
        priceCents: 8500,
        stock: 30,
        unit: ProductUnit.L,
        isOrganic: true,
        isActive: true,
      },
      {
        farmId: farms[0].id,
        categoryId: eggs.id,
        sku: 'SUN-EGGS-10',
        name: 'Яйця курячі домашні (10 шт)',
        description: 'Від курей вільного випасу. Яскравий жовток.',
        priceCents: 7500,
        stock: 40,
        unit: ProductUnit.PCS,
        weightGrams: 600,
        isOrganic: true,
        isActive: true,
      },

      // Ферма Зелений Гай — овочі та фрукти
      {
        farmId: farms[1].id,
        categoryId: vegetables.id,
        sku: 'ZG-TOMATO-CHERRY',
        name: 'Помідори чері',
        description: 'Солодкі помідори чері, зібрані вручну.',
        priceCents: 12900,
        stock: 35,
        unit: ProductUnit.KG,
        isOrganic: true,
        harvestDate: new Date('2026-02-02'),
        expiresAt: new Date('2026-02-10'),
        isActive: true,
      },
      {
        farmId: farms[1].id,
        categoryId: vegetables.id,
        sku: 'ZG-CUCUMBER-LONG',
        name: 'Огірки довгоплідні',
        description: 'Хрусткі тепличні огірки без гіркоти.',
        priceCents: 6900,
        stock: 45,
        unit: ProductUnit.KG,
        isOrganic: true,
        harvestDate: new Date('2026-02-03'),
        expiresAt: new Date('2026-02-12'),
        isActive: true,
      },
      {
        farmId: farms[1].id,
        categoryId: fruits.id,
        sku: 'ZG-APPLE-GOLDEN',
        name: 'Яблука Голден',
        description: 'Солодкі яблука із власного саду.',
        priceCents: 4500,
        stock: 100,
        unit: ProductUnit.KG,
        isOrganic: true,
        isActive: true,
      },
      {
        farmId: farms[1].id,
        categoryId: vegetables.id,
        sku: 'ZG-POTATO-YOUNG',
        name: 'Картопля молода',
        description: 'Рання картопля з піщаного ґрунту.',
        priceCents: 3500,
        stock: 200,
        unit: ProductUnit.KG,
        isOrganic: false,
        isActive: true,
      },

      // Пасіка Медова Долина — мед
      {
        farmId: farms[2].id,
        categoryId: honey.id,
        sku: 'MD-HONEY-LIPA',
        name: 'Мед липовий',
        description: 'Ароматний липовий мед з Карпат. Збір 2025 року.',
        priceCents: 35000,
        stock: 20,
        unit: ProductUnit.L,
        isOrganic: false,
        isActive: true,
      },
      {
        farmId: farms[2].id,
        categoryId: honey.id,
        sku: 'MD-HONEY-FLOWER',
        name: "Мед різнотрав'я",
        description: "Карпатське різнотрав'я. Темний, насичений.",
        priceCents: 28000,
        stock: 30,
        unit: ProductUnit.L,
        isOrganic: false,
        isActive: true,
      },

      // Хутір Козацький — м'ясо
      {
        farmId: farms[3].id,
        categoryId: meat.id,
        sku: 'KZ-SAUSAGE-HOME',
        name: 'Ковбаса домашня',
        description: 'Свиняча ковбаса за бабусиним рецептом.',
        priceCents: 32000,
        stock: 15,
        unit: ProductUnit.KG,
        isOrganic: false,
        isActive: true,
      },
      {
        farmId: farms[3].id,
        categoryId: meat.id,
        sku: 'KZ-SALO-SMOKED',
        name: 'Сало копчене',
        description: 'Копчене на вільховій тріщі.',
        priceCents: 25000,
        stock: 20,
        unit: ProductUnit.KG,
        isOrganic: false,
        isActive: true,
      },
    ]);

    console.log(`✅ Products: ${products.length} created`);

    // ==========================================
    // USERS
    // ==========================================
    const userRepo = queryRunner.manager.getRepository(User);

    const users = await userRepo.save([
      {
        email: 'customer@farmbox.ua',
        passwordHash,
        name: 'Олена Покупець',
        phone: '+380501234567',
        roles: [UserRole.CUSTOMER],
        isActive: true,
      },
      {
        email: 'customer2@farmbox.ua',
        passwordHash,
        name: 'Іван Тестовий',
        phone: '+380507654321',
        roles: [UserRole.CUSTOMER],
        isActive: true,
      },
      {
        email: 'admin@farmbox.ua',
        passwordHash,
        name: 'Адмін FarmBox',
        roles: [UserRole.ADMIN],
        isActive: true,
      },
      {
        email: 'farmer1@farmbox.ua',
        passwordHash,
        name: 'Петро Фермер',
        phone: '+380509876543',
        roles: [UserRole.CUSTOMER, UserRole.FARMER],
        farmId: farms[0].id,
        isActive: true,
      },
      {
        email: 'farmer2@farmbox.ua',
        passwordHash,
        name: 'Марія Садівниця',
        phone: '+380501112233',
        roles: [UserRole.CUSTOMER, UserRole.FARMER],
        farmId: farms[1].id,
        isActive: true,
      },
      {
        email: 'support@farmbox.ua',
        passwordHash,
        name: 'Підтримка FarmBox',
        roles: [UserRole.SUPPORT],
        isActive: true,
      },
    ]);

    console.log(`✅ Users: ${users.length} created`);

    // ==========================================
    // COMMIT
    // ==========================================
    await queryRunner.commitTransaction();
    console.log('\n🎉 Seed completed successfully!');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('\n❌ Seed failed:', error);
    throw error;
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

seed();

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin01@gmail.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin@123'
  const hashedPassword = await bcrypt.hash(adminPassword, 12)
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Mukifood Admin',
      role: 'admin',
      phone: '9876543210',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // 2. Create delivery person
  const deliveryPass = await bcrypt.hash('delivery123', 12)
  const deliveryPerson = await prisma.user.upsert({
    where: { email: 'delivery@mukifood.com' },
    update: {},
    create: {
      email: 'delivery@mukifood.com',
      password: deliveryPass,
      name: 'Ravi Kumar',
      role: 'delivery',
      phone: '9876543211',
    },
  })
  console.log('✅ Delivery person created:', deliveryPerson.email)

  // 3. Create categories
  const jaggeryCategory = await prisma.category.upsert({
    where: { slug: 'jaggery' },
    update: {},
    create: {
      nameEn: 'Jaggery',
      nameTa: 'வெல்லம்',
      slug: 'jaggery',
      sortOrder: 1,
    },
  })

  const spicesCategory = await prisma.category.upsert({
    where: { slug: 'spices' },
    update: {},
    create: {
      nameEn: 'Spices',
      nameTa: 'மசாலாப் பொருட்கள்',
      slug: 'spices',
      sortOrder: 2,
    },
  })

  const milletsCategory = await prisma.category.upsert({
    where: { slug: 'millets' },
    update: {},
    create: {
      nameEn: 'Millets',
      nameTa: 'சிறுதானியங்கள்',
      slug: 'millets',
      sortOrder: 3,
    },
  })
  console.log('✅ Categories created')

  // 4. Create Nattu Sakarai product with variants
  const nattuSakarai = await prisma.product.upsert({
    where: { slug: 'nattu-sakarai' },
    update: {},
    create: {
      categoryId: jaggeryCategory.id,
      nameEn: 'Nattu Sakarai (Country Jaggery)',
      nameTa: 'நாட்டு சர்க்கரை (நாட்டு வெல்லம்)',
      slug: 'nattu-sakarai',
      descriptionEn: 'Premium quality traditional country jaggery made from fresh sugarcane juice. Unrefined, chemical-free, and rich in minerals. Perfect for cooking, making sweets, or as a healthy sugar alternative. Our jaggery is prepared using traditional methods passed down through generations.',
      descriptionTa: 'புதிய கரும்பு சாற்றிலிருந்து தயாரிக்கப்பட்ட உயர்தரமான பாரம்பரிய நாட்டு வெல்லம். சுத்திகரிக்கப்படாத, ரசாயனம் இல்லாத, தாதுக்கள் நிறைந்தது. சமையல், இனிப்புகள் செய்ய, அல்லது ஆரோக்கியமான சர்க்கரை மாற்றாக சிறந்தது.',
      ingredientsEn: 'Pure sugarcane juice (100%). No additives, no chemicals.',
      ingredientsTa: 'தூய கரும்பு சாறு (100%). சேர்க்கைகள் இல்லை, ரசாயனங்கள் இல்லை.',
      shelfLife: '12 months',
      images: JSON.stringify(['/images/jaggery-1.jpg', '/images/jaggery-2.jpg']),
      featured: true,
      gstPercent: 0,
    },
  })

  // Create variants
  const variants = [
    { nameEn: '250g', nameTa: '250 கிராம்', sku: 'NS-250', price: 85, weight: 250, stock: 100 },
    { nameEn: '500g', nameTa: '500 கிராம்', sku: 'NS-500', price: 160, weight: 500, stock: 80 },
    { nameEn: '1 Kg', nameTa: '1 கிலோ', sku: 'NS-1000', price: 299, weight: 1000, stock: 50 },
  ]

  for (const v of variants) {
    await prisma.productVariant.upsert({
      where: { sku: v.sku },
      update: { price: v.price, stock: v.stock },
      create: {
        productId: nattuSakarai.id,
        nameEn: v.nameEn,
        nameTa: v.nameTa,
        sku: v.sku,
        price: v.price,
        mrp: Math.round(v.price * 1.2),
        weight: v.weight,
        stock: v.stock,
        lowStockThreshold: 5,
      },
    })
  }
  console.log('✅ Nattu Sakarai product & variants created')

  // 5. Create Palm Jaggery product
  const palmJaggery = await prisma.product.upsert({
    where: { slug: 'palm-jaggery' },
    update: {},
    create: {
      categoryId: jaggeryCategory.id,
      nameEn: 'Palm Jaggery (Karupatti)',
      nameTa: 'கருப்பட்டி (பனை வெல்லம்)',
      slug: 'palm-jaggery',
      descriptionEn: 'Pure palm jaggery (Karupatti) made from palmyra palm sap. Rich in iron, calcium, and other essential minerals. A healthier sweetener with a distinct smoky flavor.',
      descriptionTa: 'பனை மரத்தின் சாற்றிலிருந்து தயாரிக்கப்பட்ட தூய கருப்பட்டி. இரும்பு, கால்சியம் மற்றும் அத்தியாவசிய தாதுக்கள் நிறைந்தது.',
      ingredientsEn: 'Pure palmyra palm sap (100%).',
      ingredientsTa: 'தூய பனை சாறு (100%).',
      shelfLife: '10 months',
      images: JSON.stringify(['/images/palm-jaggery-1.jpg']),
      featured: true,
      gstPercent: 0,
    },
  })

  const palmVariants = [
    { nameEn: '250g', nameTa: '250 கிராம்', sku: 'PJ-250', price: 120, weight: 250, stock: 60 },
    { nameEn: '500g', nameTa: '500 கிராம்', sku: 'PJ-500', price: 220, weight: 500, stock: 40 },
  ]

  for (const v of palmVariants) {
    await prisma.productVariant.upsert({
      where: { sku: v.sku },
      update: { price: v.price, stock: v.stock },
      create: {
        productId: palmJaggery.id,
        nameEn: v.nameEn,
        nameTa: v.nameTa,
        sku: v.sku,
        price: v.price,
        mrp: Math.round(v.price * 1.15),
        weight: v.weight,
        stock: v.stock,
        lowStockThreshold: 5,
      },
    })
  }
  console.log('✅ Palm Jaggery product & variants created')

  // 6. Create Jaggery Powder product
  const jaggeryPowder = await prisma.product.upsert({
    where: { slug: 'jaggery-powder' },
    update: {},
    create: {
      categoryId: jaggeryCategory.id,
      nameEn: 'Jaggery Powder',
      nameTa: 'வெல்லத் தூள்',
      slug: 'jaggery-powder',
      descriptionEn: 'Finely ground jaggery powder, easy to use in cooking, baking, and beverages. Retains all the natural minerals and goodness of traditional jaggery.',
      descriptionTa: 'நுண்ணிய வெல்லத் தூள், சமையல், பேக்கிங் மற்றும் பானங்களில் பயன்படுத்த எளிதானது. பாரம்பரிய வெல்லத்தின் அனைத்து இயற்கை தாதுக்களையும் நன்மைகளையும் தக்கவைக்கிறது.',
      ingredientsEn: 'Ground jaggery (100%).',
      ingredientsTa: 'அரைக்கப்பட்ட வெல்லம் (100%).',
      shelfLife: '8 months',
      images: JSON.stringify(['/images/jaggery-powder-1.jpg']),
      featured: false,
      gstPercent: 0,
    },
  })

  await prisma.productVariant.upsert({
    where: { sku: 'JP-500' },
    update: {},
    create: {
      productId: jaggeryPowder.id,
      nameEn: '500g',
      nameTa: '500 கிராம்',
      sku: 'JP-500',
      price: 180,
      mrp: 210,
      weight: 500,
      stock: 30,
      lowStockThreshold: 5,
    },
  })
  console.log('✅ Jaggery Powder product created')

  // 7. Create coupons
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      descriptionEn: '10% off on your first order',
      descriptionTa: 'உங்கள் முதல் ஆர்டரில் 10% தள்ளுபடி',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 200,
      maxDiscount: 100,
      usageLimit: 100,
    },
  })

  await prisma.coupon.upsert({
    where: { code: 'FLAT50' },
    update: {},
    create: {
      code: 'FLAT50',
      descriptionEn: 'Flat ₹50 off on orders above ₹500',
      descriptionTa: '₹500 க்கு மேல் ₹50 தள்ளுபடி',
      discountType: 'flat',
      discountValue: 50,
      minOrderAmount: 500,
      usageLimit: 50,
    },
  })

  await prisma.coupon.upsert({
    where: { code: 'PONGAL25' },
    update: {},
    create: {
      code: 'PONGAL25',
      descriptionEn: 'Pongal special! 25% off',
      descriptionTa: 'பொங்கல் ஸ்பெஷல்! 25% தள்ளுபடி',
      discountType: 'percentage',
      discountValue: 25,
      minOrderAmount: 300,
      maxDiscount: 200,
      usageLimit: 200,
    },
  })
  console.log('✅ Coupons created')

  // 8. Create pincode zones
  const pincodes = [
    { pincode: '600001', zoneName: 'local', deliveryCharge: 40, estimatedDays: 2 },
    { pincode: '600002', zoneName: 'local', deliveryCharge: 40, estimatedDays: 2 },
    { pincode: '600028', zoneName: 'local', deliveryCharge: 40, estimatedDays: 2 },
    { pincode: '600040', zoneName: 'local', deliveryCharge: 40, estimatedDays: 2 },
    { pincode: '600100', zoneName: 'local', deliveryCharge: 50, estimatedDays: 3 },
    { pincode: '625001', zoneName: 'state', deliveryCharge: 60, estimatedDays: 3 },
    { pincode: '625002', zoneName: 'state', deliveryCharge: 60, estimatedDays: 3 },
    { pincode: '641001', zoneName: 'state', deliveryCharge: 60, estimatedDays: 3 },
    { pincode: '560001', zoneName: 'national', deliveryCharge: 80, estimatedDays: 5 },
    { pincode: '560002', zoneName: 'national', deliveryCharge: 80, estimatedDays: 5 },
    { pincode: '500001', zoneName: 'national', deliveryCharge: 80, estimatedDays: 5 },
    { pincode: '110001', zoneName: 'national', deliveryCharge: 100, estimatedDays: 7 },
    { pincode: '400001', zoneName: 'national', deliveryCharge: 90, estimatedDays: 5 },
    { pincode: '700001', zoneName: 'national', deliveryCharge: 100, estimatedDays: 7 },
  ]

  for (const p of pincodes) {
    await prisma.pincodeZone.upsert({
      where: { pincode: p.pincode },
      update: {},
      create: p,
    })
  }
  console.log('✅ Pincode zones created')

  // 9. Create settings
  const settings = [
    { key: 'store_name', value: 'MUKIFOOD PRODUCTS' },
    { key: 'store_phone', value: '9876543210' },
    { key: 'store_email', value: 'hello@mukifood.com' },
    { key: 'store_upi_id', value: 'mukifood@upi' },
    { key: 'store_gst', value: '33XXXXX1234X1ZX' },
    { key: 'free_delivery_threshold', value: '500' },
    { key: 'default_delivery_charge', value: '60' },
    { key: 'loyalty_points_per_100', value: '10' },
    { key: 'loyalty_point_value', value: '1' },
    { key: 'store_open', value: 'true' },
    { key: 'gst_rate', value: '0' },
    { key: 'whatsapp_number', value: '919876543210' },
  ]

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    })
  }
  console.log('✅ Settings created')

  // 10. Create a sample bundle
  await prisma.bundle.upsert({
    where: { slug: 'pongal-gift-box' },
    update: {},
    create: {
      nameEn: 'Pongal Gift Box',
      nameTa: 'பொங்கல் பரிசு பெட்டி',
      slug: 'pongal-gift-box',
      descriptionEn: 'A perfect Pongal gift! Includes Nattu Sakarai (500g) + Palm Jaggery (250g) in a beautiful gift box.',
      descriptionTa: 'சிறந்த பொங்கல் பரிசு! நாட்டு சர்க்கரை (500g) + கருப்பட்டி (250g) அழகான பரிசு பெட்டியில்.',
      price: 350,
      mrp: 420,
      festivalTag: 'pongal',
      active: true,
    },
  })
  console.log('✅ Bundle created')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📋 Login credentials:')
  console.log('   Admin: admin01@gmail.com / admin@123')
  console.log('   Delivery: delivery@mukifood.com / delivery123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'
import bcrypt from 'bcryptjs'

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const defaultPassword = await bcrypt.hash('password123', 10)

  console.log('Memulai proses seeding data Vizada ERP & Percetakan...')

  console.log('0. Membersihkan data lama untuk seeding ulang yang konsisten...')
  await prisma.photoRecord.deleteMany()
  await prisma.qCChecklistItem.deleteMany()
  await prisma.productionSchedule.deleteMany()
  await prisma.qualityControl.deleteMany()
  await prisma.productionJob.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.archive.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.productMaterial.deleteMany()
  await prisma.productDesign.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.inventoryLog.deleteMany()
  await prisma.materialEstimate.deleteMany()
  await prisma.material.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.maintenanceSchedule.deleteMany()
  await prisma.machineMaintenanceLog.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.promoUsage.deleteMany()
  await prisma.voucherCode.deleteMany()
  await prisma.promotion.deleteMany()
  await prisma.financialTransaction.deleteMany()
  await prisma.financialCategory.deleteMany()

  console.log('1. Membuat Data Pengguna...')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mail.com' },
    update: { name: 'Admin Utama', role: 'ADMIN', phone: '0811111111' },
    create: { name: 'Admin Utama', email: 'admin@mail.com', passwordHash: defaultPassword, role: 'ADMIN', phone: '0811111111' },
  })

  const operator1 = await prisma.user.upsert({
    where: { email: 'operator@mail.com' },
    update: { name: 'Budi Operator', role: 'OPERATOR', phone: '0822222222' },
    create: { name: 'Budi Operator', email: 'operator@mail.com', passwordHash: defaultPassword, role: 'OPERATOR', phone: '0822222222' },
  })

  const management = await prisma.user.upsert({
    where: { email: 'management@mail.com' },
    update: { name: 'Manager Produksi', role: 'MANAGEMENT', phone: '0844444444' },
    create: { name: 'Manager Produksi', email: 'management@mail.com', passwordHash: defaultPassword, role: 'MANAGEMENT', phone: '0844444444' },
  })

  const customer1 = await prisma.user.upsert({
    where: { email: 'customer@mail.com' },
    update: { name: 'Pelanggan Setia', role: 'CUSTOMER', phone: '0855555555' },
    create: { name: 'Pelanggan Setia', email: 'customer@mail.com', passwordHash: defaultPassword, role: 'CUSTOMER', phone: '0855555555' },
  })

  console.log('2. Membuat Kategori & Supplier...')
  const catDigital = await prisma.category.create({ data: { name: 'Digital Printing A3+' } })
  const catOutdoor = await prisma.category.create({ data: { name: 'Large Format (Outdoor & Indoor)' } })
  const catSticker = await prisma.category.create({ data: { name: 'Stiker & Label Kemasan' } })
  const catMerchandise = await prisma.category.create({ data: { name: 'Merchandise & Souvenir' } })

  const supKertas = await prisma.supplier.create({ data: { name: 'PT Kertas Nasional', contact: '021-999888' } })
  const supTinta = await prisma.supplier.create({ data: { name: 'CV Tinta Makmur', contact: '081299997777' } })
  const supReklame = await prisma.supplier.create({ data: { name: 'PT Surya Reklame Grafika', contact: '081388884444' } })
  const supSouvenir = await prisma.supplier.create({ data: { name: 'CV Aneka Souvenirindo', contact: '081577773333' } })

  console.log('3. Membuat Material & Log Inventaris...')
  const matArtPaper = await prisma.material.create({ 
    data: { name: 'Art Paper 150gr (A3+)', stockQty: 8000, minStock: 1000, unit: 'Lembar', supplierId: supKertas.id } 
  })
  const matArtCarton = await prisma.material.create({ 
    data: { name: 'Art Carton 260gr (A3+)', stockQty: 5000, minStock: 800, unit: 'Lembar', supplierId: supKertas.id } 
  })
  const matLaminasiDoff = await prisma.material.create({ 
    data: { name: 'Roll Laminasi Doff (Panas)', stockQty: 300, minStock: 30, unit: 'Meter', supplierId: supKertas.id } 
  })
  const matFlexi = await prisma.material.create({ 
    data: { name: 'Bahan Flexi Standard 280gsm', stockQty: 200, minStock: 50, unit: 'Meter', supplierId: supReklame.id } 
  })
  const matAlbatros = await prisma.material.create({ 
    data: { name: 'Bahan Albatros 210gsm (Indoor)', stockQty: 120, minStock: 30, unit: 'Meter', supplierId: supReklame.id } 
  })
  const matStikerVinyl = await prisma.material.create({ 
    data: { name: 'Bahan Stiker Vinyl Glossy (A3+)', stockQty: 3000, minStock: 500, unit: 'Lembar', supplierId: supReklame.id } 
  })
  const matStikerCromo = await prisma.material.create({ 
    data: { name: 'Bahan Stiker Cromo Glossy (A3+)', stockQty: 4000, minStock: 500, unit: 'Lembar', supplierId: supKertas.id } 
  })
  const matMugPolos = await prisma.material.create({ 
    data: { name: 'Mug Keramik Putih Polos SNI', stockQty: 350, minStock: 50, unit: 'Pcs', supplierId: supSouvenir.id } 
  })
  const matLanyardRoll = await prisma.material.create({ 
    data: { name: 'Roll Tali Lanyard Tissue 2cm', stockQty: 500, minStock: 100, unit: 'Meter', supplierId: supSouvenir.id } 
  })
  const matToner = await prisma.material.create({ 
    data: { name: 'Toner Digital CMYK Konica', stockQty: 25, minStock: 5, unit: 'Cartridge', supplierId: supTinta.id } 
  })
  const matTintaOutdoor = await prisma.material.create({ 
    data: { name: 'Tinta Solvent / Eco-Solvent CMYK', stockQty: 40, minStock: 10, unit: 'Liter', supplierId: supTinta.id } 
  })

  await prisma.inventoryLog.createMany({
    data: [
      { materialId: matArtPaper.id, type: 'IN', qty: 8000, notes: 'Stok Awal' },
      { materialId: matArtCarton.id, type: 'IN', qty: 5000, notes: 'Stok Awal' },
      { materialId: matLaminasiDoff.id, type: 'IN', qty: 300, notes: 'Stok Awal' },
      { materialId: matFlexi.id, type: 'IN', qty: 200, notes: 'Stok Awal' },
      { materialId: matAlbatros.id, type: 'IN', qty: 120, notes: 'Stok Awal' },
      { materialId: matStikerVinyl.id, type: 'IN', qty: 3000, notes: 'Stok Awal' },
      { materialId: matStikerCromo.id, type: 'IN', qty: 4000, notes: 'Stok Awal' },
      { materialId: matMugPolos.id, type: 'IN', qty: 350, notes: 'Stok Awal' },
      { materialId: matLanyardRoll.id, type: 'IN', qty: 500, notes: 'Stok Awal' },
      { materialId: matToner.id, type: 'IN', qty: 25, notes: 'Stok Awal' },
      { materialId: matTintaOutdoor.id, type: 'IN', qty: 40, notes: 'Stok Awal' },
    ]
  })

  console.log('4. Membuat Produk Katalog Lengkap & BOM (Bill of Materials)...')

  // 1. Brosur A4
  const prodBrosur = await prisma.product.create({
    data: {
      categoryId: catDigital.id, 
      name: 'Cetak Brosur A4 (Art Paper 150gr)', 
      description: 'Cetak brosur lipat 2 atau 3 full color menggunakan kertas Art Paper 150gr berkualitas tinggi. Warna cerah & tajam, harga per 1 rim (500 lembar).', 
      basePrice: 150000, 
      unit: 'Rim',
      imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop',
      designs: {
        create: [
          { 
            title: 'Template Brosur Promosi Bisnis & Usaha', 
            imageUrl: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&auto=format&fit=crop' 
          },
          { 
            title: 'Template Brosur Event & Wisata Kuliner', 
            imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop' 
          }
        ]
      },
      materials: {
        create: [
          { materialId: matArtPaper.id, qtyNeeded: 250 },
          { materialId: matToner.id, qtyNeeded: 0.05 }
        ]
      }
    }
  })

  // 2. Kartu Nama
  const prodKartuNama = await prisma.product.create({
    data: {
      categoryId: catDigital.id,
      name: 'Kartu Nama Bisnis Premium (Laminasi Doff)',
      description: 'Kartu nama eksklusif bahan Art Carton 260gr dengan finishing laminasi doff halus bolak-balik. Isi 100 lembar per box plastik transparan.',
      basePrice: 35000,
      unit: 'Box',
      imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop',
      designs: {
        create: [
          {
            title: 'Template Kartu Nama Elegan Minimalis',
            imageUrl: 'https://images.unsplash.com/photo-1616628188506-4ad99d65640e?w=600&auto=format&fit=crop'
          },
          {
            title: 'Template Kartu Nama Modern Corporate',
            imageUrl: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&auto=format&fit=crop'
          }
        ]
      },
      materials: {
        create: [
          { materialId: matArtCarton.id, qtyNeeded: 5 },
          { materialId: matLaminasiDoff.id, qtyNeeded: 1.5 },
          { materialId: matToner.id, qtyNeeded: 0.01 }
        ]
      }
    }
  })

  // 3. Poster A3+
  const prodPoster = await prisma.product.create({
    data: {
      categoryId: catDigital.id,
      name: 'Poster A3+ High Definition',
      description: 'Cetak poster ukuran A3+ (32 x 48 cm) kertas Art Carton 260gr tebal. Hasil cetak resolusi tinggi tanpa garis, cocok untuk dekorasi kamar atau promosi toko.',
      basePrice: 8000,
      unit: 'Lembar',
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop',
      designs: {
        create: [
          {
            title: 'Template Poster Musik & Festival Komunitas',
            imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop'
          },
          {
            title: 'Template Poster Promo Diskon Cuci Gudang',
            imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop'
          }
        ]
      },
      materials: {
        create: [
          { materialId: matArtCarton.id, qtyNeeded: 1 },
          { materialId: matToner.id, qtyNeeded: 0.01 }
        ]
      }
    }
  })

  // 4. Sertifikat / Piagam
  const prodSertifikat = await prisma.product.create({
    data: {
      categoryId: catDigital.id,
      name: 'Sertifikat & Piagam Penghargaan Resmi',
      description: 'Cetak piagam penghargaan & sertifikat resmi kertas Art Carton 260gr tebal dengan kualitas warna pekat anti luntur. Cocok untuk seminar, workshop, atau kompetisi.',
      basePrice: 6000,
      unit: 'Lembar',
      imageUrl: 'https://images.unsplash.com/photo-1589330694653-dad6bc49cfca?w=600&auto=format&fit=crop',
      designs: {
        create: [
          {
            title: 'Template Sertifikat Kelulusan & Webinar',
            imageUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop'
          },
          {
            title: 'Template Piagam Apresiasi Prestasi & Penghargaan',
            imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop'
          }
        ]
      },
      materials: {
        create: [
          { materialId: matArtCarton.id, qtyNeeded: 1 },
          { materialId: matToner.id, qtyNeeded: 0.008 }
        ]
      }
    }
  })

  // 5. Buku Menu Jilid Spiral
  const prodBukuMenu = await prisma.product.create({
    data: {
      categoryId: catDigital.id,
      name: 'Buku Menu Restoran / Cafe Jilid Spiral',
      description: 'Buku menu eksklusif jilid spiral kawat besi kuat. Cover depan belakang Art Carton dilapisi laminasi doff tahan cipratan air dan minyak.',
      basePrice: 45000,
      unit: 'Buku',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
      designs: {
        create: [
          {
            title: 'Template Menu Cafe Kopi & Dessert Modern',
            imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop'
          },
          {
            title: 'Template Menu Restoran Nusantara & Seafood',
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop'
          }
        ]
      },
      materials: {
        create: [
          { materialId: matArtCarton.id, qtyNeeded: 6 },
          { materialId: matLaminasiDoff.id, qtyNeeded: 2 },
          { materialId: matToner.id, qtyNeeded: 0.03 }
        ]
      }
    }
  })

  // 6. Spanduk 280gr Outdoor
  const prodSpanduk = await prisma.product.create({
    data: {
      categoryId: catOutdoor.id, 
      name: 'Spanduk Flexi 280gr Outdoor', 
      description: 'Spanduk banner outdoor bahan flexi standar 280gsm, tahan cuaca dan panas matahari. Free finishing keling ring mata ayam di setiap sudut.', 
      basePrice: 15000, 
      unit: 'Meter',
      imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop',
      designs: {
        create: [
          { 
            title: 'Template Banner Grand Opening Toko Baru', 
            imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop' 
          },
          { 
            title: 'Template Spanduk Wisuda & Kelulusan Sekolah', 
            imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop' 
          }
        ]
      },
      materials: {
        create: [
          { materialId: matFlexi.id, qtyNeeded: 1 },
          { materialId: matTintaOutdoor.id, qtyNeeded: 0.02 }
        ]
      }
    }
  })

  // 7. Roll Up Banner
  const prodRollUp = await prisma.product.create({
    data: {
      categoryId: catOutdoor.id,
      name: 'Roll Up Banner 60x160cm Albatros',
      description: 'Banner berdiri portable dengan sistem roll-up otomatis. Bahan albatros semi-doff anti lengkung lengkap dengan tiang penyangga aluminium kokoh dan tas jinjing canvas.',
      basePrice: 110000,
      unit: 'Set',
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop',
      designs: {
        create: [
          {
            title: 'Template Roll Up Banner Pameran & Expo',
            imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop'
          },
          {
            title: 'Template Standing Banner Info Produk & Diskon',
            imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop'
          }
        ]
      },
      materials: {
        create: [
          { materialId: matAlbatros.id, qtyNeeded: 1.5 },
          { materialId: matTintaOutdoor.id, qtyNeeded: 0.03 }
        ]
      }
    }
  })

  // 8. X-Banner
  const prodXBanner = await prisma.product.create({
    data: {
      categoryId: catOutdoor.id,
      name: 'X-Banner Praktis 60x160cm',
      description: 'Standing banner ekonomis menggunakan rangka fiber X lentur dan kuat. Bahan cetak tahan cuaca, mudah dibongkar pasang untuk pameran atau depan pintu toko.',
      basePrice: 48000,
      unit: 'Set',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop',
      designs: {
        create: [
          {
            title: 'Template X-Banner Rekrutmen & Lowongan Kerja',
            imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&auto=format&fit=crop'
          },
          {
            title: 'Template X-Banner Klinik & Layanan Kesehatan',
            imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop'
          }
        ]
      },
      materials: {
        create: [
          { materialId: matFlexi.id, qtyNeeded: 1 },
          { materialId: matTintaOutdoor.id, qtyNeeded: 0.02 }
        ]
      }
    }
  })

  // 9. Stiker Vinyl A3+ Kiss Cut
  const prodStikerVinyl = await prisma.product.create({
    data: {
      categoryId: catSticker.id,
      name: 'Stiker Vinyl A3+ Kiss-Cut (Tahan Air)',
      description: 'Cetak stiker label botol minuman, kosmetik, atau frozen food. Bahan vinyl sintetis tahan air dan minyak, sudah termasuk potong pola bentuk presisi sesuai desain.',
      basePrice: 16000,
      unit: 'Lembar',
      imageUrl: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&auto=format&fit=crop',
      designs: {
        create: [
          {
            title: 'Template Stiker Label Kopi & Minuman Kekinian',
            imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop'
          },
          {
            title: 'Template Stiker Sambal & Kemasan Makanan Ringan',
            imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop'
          }
        ]
      },
      materials: {
        create: [
          { materialId: matStikerVinyl.id, qtyNeeded: 1 },
          { materialId: matToner.id, qtyNeeded: 0.015 }
        ]
      }
    }
  })

  // 10. Stiker Cromo A3+ Glossy
  const prodStikerCromo = await prisma.product.create({
    data: {
      categoryId: catSticker.id,
      name: 'Stiker Cromo A3+ Glossy (Label Kemasan & Box)',
      description: 'Stiker bahan kertas glossy mengkilap dengan daya rekat sangat kuat. Pilihan ekonomis untuk label box kue kering, toples, atau segel kemasan packing paket olshop.',
      basePrice: 11000,
      unit: 'Lembar',
      imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&auto=format&fit=crop',
      designs: {
        create: [
          {
            title: 'Template Segel Toples Kue Kering & Hampers',
            imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop'
          },
          {
            title: 'Template Stiker Thank You Card & Olshop',
            imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop'
          }
        ]
      },
      materials: {
        create: [
          { materialId: matStikerCromo.id, qtyNeeded: 1 },
          { materialId: matToner.id, qtyNeeded: 0.012 }
        ]
      }
    }
  })

  // 11. Mug Keramik Custom Sublim
  const prodMug = await prisma.product.create({
    data: {
      categoryId: catMerchandise.id,
      name: 'Cetak Custom Mug Keramik Souvenir',
      description: 'Mug keramik putih SNI berkualitas dengan hasil cetak sublimasi full color mengkilap tahan cuci. Sudah termasuk free packaging box putih satuan rapi.',
      basePrice: 22000,
      unit: 'Pcs',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop',
      designs: {
        create: [
          {
            title: 'Template Mug Souvenir Ulang Tahun & Nikahan',
            imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop'
          },
          {
            title: 'Template Mug Branding Logo Kantor & Komunitas',
            imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop'
          }
        ]
      },
      materials: {
        create: [
          { materialId: matMugPolos.id, qtyNeeded: 1 },
          { materialId: matToner.id, qtyNeeded: 0.01 }
        ]
      }
    }
  })

  // 12. Tali Lanyard ID Card Printing
  const prodLanyard = await prisma.product.create({
    data: {
      categoryId: catMerchandise.id,
      name: 'Tali Lanyard ID Card Printing (2 Sisi)',
      description: 'Tali lanyard bahan tissue premium lebar 2 cm halus dan nyaman di leher. Cetak full color 2 sisi dilengkapi pengait besi tebal dan stopper lepas-pasang.',
      basePrice: 12000,
      unit: 'Pcs',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop',
      designs: {
        create: [
          {
            title: 'Template Lanyard Pegawai Perusahaan Swasta & BUMN',
            imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop'
          },
          {
            title: 'Template Lanyard Kepanitiaan Event Musik & Seminar',
            imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop'
          }
        ]
      },
      materials: {
        create: [
          { materialId: matLanyardRoll.id, qtyNeeded: 1 },
          { materialId: matToner.id, qtyNeeded: 0.008 }
        ]
      }
    }
  })

  console.log('5. Membuat Mesin & Jadwal Maintenance...')
  const machine1 = await prisma.machine.create({ data: { name: 'Konica Minolta AccurioPrint (A3+)', status: 'AVAILABLE' } })
  const machine2 = await prisma.machine.create({ data: { name: 'Mesin Outdoor Flora 3.2m', status: 'IN_USE' } })
  const machine3 = await prisma.machine.create({ data: { name: 'Mesin Cutting Sticker Graphtec', status: 'AVAILABLE' } })
  const machine4 = await prisma.machine.create({ data: { name: 'Mesin Heat Press Mug & Sublimasi', status: 'AVAILABLE' } })

  await prisma.maintenanceSchedule.create({
    data: {
      machineId: machine1.id,
      interval: 30,
      nextDue: new Date(new Date().setDate(new Date().getDate() + 15)),
      notes: 'Pembersihan optical laser dan ganti drum unit bulanan'
    }
  })

  await prisma.maintenanceSchedule.create({
    data: {
      machineId: machine2.id,
      interval: 14,
      nextDue: new Date(new Date().setDate(new Date().getDate() + 7)),
      notes: 'Pembersihan printhead dan flush saluran tinta solvent'
    }
  })

  console.log('6. Membuat Kategori Keuangan & Transaksi Awal...')
  const catModal = await prisma.financialCategory.create({ data: { name: 'Modal Usaha', type: 'PEMASUKAN' } })
  const catBahan = await prisma.financialCategory.create({ data: { name: 'Belanja Bahan Baku', type: 'PENGELUARAN' } })
  const catSales = await prisma.financialCategory.create({ data: { name: 'Penjualan Cetak', type: 'PEMASUKAN' } })

  await prisma.financialTransaction.createMany({
    data: [
      { categoryId: catModal.id, type: 'PEMASUKAN', amount: 50000000, description: 'Suntikan modal awal operasional' },
      { categoryId: catBahan.id, type: 'PENGELUARAN', amount: 15000000, description: 'Belanja stok bahan baku kertas, vinyl, dan tinta' }
    ]
  })

  console.log('7. Membuat Promosi & Voucher...')
  await prisma.promotion.create({
    data: {
      name: 'Diskon Spesial Awal Tahun',
      type: 'DISKON_PERSEN',
      value: 10,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      active: true
    }
  })

  console.log('8. Simulasi Pesanan, Produksi, dan QC...')
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'VZ-20260506-1001',
      customerId: customer1.id,
      status: 'COMPLETED',
      totalAmount: 300000,
      deadline: new Date(new Date().setDate(new Date().getDate() + 2)),
      items: {
        create: {
          productId: prodBrosur.id,
          qty: 2,
          specifications: { 
            notes: "Warna cerah, cetak brosur promosi bisnis lipat 3",
            designMode: "TEMPLATE",
            templateTitle: "Template Brosur Promosi Bisnis & Usaha"
          },
          fileUrl: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&auto=format&fit=crop",
          subtotal: 300000
        }
      },
      payment: {
        create: {
          amount: 300000,
          method: 'BCA - 1234567890 (Vizada)',
          status: 'PAID',
          paidAt: new Date()
        }
      }
    },
    include: { items: true }
  })

  await prisma.financialTransaction.create({
    data: { categoryId: catSales.id, type: 'PEMASUKAN', amount: 300000, description: `Pembayaran Order ${order1.orderNumber}` }
  })

  const job1 = await prisma.productionJob.create({
    data: {
      orderItemId: order1.items[0].id,
      operatorId: operator1.id,
      machineId: machine1.id,
      status: 'DONE',
      startedAt: new Date(),
      completedAt: new Date()
    }
  })

  await prisma.qualityControl.create({
    data: {
      productionJobId: job1.id,
      inspectorId: operator1.id,
      status: 'PASSED',
      notes: '[QC: PASSED] Hasil potong rapi presisi, warna pekat sesuai file template.'
    }
  })

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'VZ-20260506-1002',
      customerId: customer1.id,
      status: 'IN_PRODUCTION',
      totalAmount: 75000,
      deadline: new Date(new Date().setDate(new Date().getDate() + 1)),
      items: {
        create: {
          productId: prodSpanduk.id,
          qty: 5,
          specifications: { 
            notes: "Beri keling mata ayam tiap sudut dan tengah",
            designMode: "CUSTOM"
          },
          fileUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop",
          subtotal: 75000
        }
      },
      payment: {
        create: {
          amount: 75000,
          method: 'BRI - 0987654321 (Vizada)',
          status: 'PAID',
          paidAt: new Date()
        }
      }
    },
    include: { items: true }
  })

  const job2 = await prisma.productionJob.create({
    data: {
      orderItemId: order2.items[0].id,
      status: 'PRINTING',
      machineId: machine2.id,
    }
  })

  await prisma.productionSchedule.create({
    data: {
      productionJobId: job2.id,
      machineId: machine2.id,
      scheduledDate: new Date(),
      priority: 'URGENT'
    }
  })

  console.log('====================================================')
  console.log('Seeding Selesai! Berhasil membuat 12 produk katalog & modul ERP.')
  console.log('Gunakan email berikut untuk login (Password: password123):')
  console.log(`- Owner/Manager : ${management.email}`)
  console.log(`- Admin Kasir   : ${admin.email}`)
  console.log(`- Operator Mesin: ${operator1.email}`)
  console.log(`- Pelanggan     : ${customer1.email}`)
  console.log('====================================================')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
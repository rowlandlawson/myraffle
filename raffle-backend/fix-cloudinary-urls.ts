/**
 * Database cleanup script to fix incomplete Cloudinary URLs
 * Run this once to migrate all existing incomplete URLs to complete HTTPS URLs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

declare const require: any;
declare const module: any;
declare const process: any;

async function fixCloudinaryUrls() {
  try {
    console.log('Starting Cloudinary URL migration...');

    // Get all items with potentially incomplete URLs
    const items = await prisma.item.findMany({
      where: {
        NOT: [
          { imageUrl: { startsWith: 'https://' } },
          { imageUrl: { startsWith: 'http://' } },
        ],
      },
    });

    console.log(`Found ${items.length} items with potentially incomplete URLs`);

    let updatedCount = 0;

    for (const item of items) {
      // Check if it's a Cloudinary partial URL
      if (item.imageUrl.includes('image/upload')) {
        const completeUrl = `https://res.cloudinary.com/${item.imageUrl}`;
        await prisma.item.update({
          where: { id: item.id },
          data: { imageUrl: completeUrl },
        });
        console.log(`✓ Updated item ${item.id}: ${item.name}`);
        console.log(`  Old: ${item.imageUrl}`);
        console.log(`  New: ${completeUrl}`);
        updatedCount++;
      }
    }

    console.log(`\nMigration complete! Updated ${updatedCount} items`);
    console.log('All Cloudinary URLs are now complete HTTPS URLs');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  fixCloudinaryUrls();
}

export { fixCloudinaryUrls };

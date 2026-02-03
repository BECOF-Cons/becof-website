#!/usr/bin/env npx tsx
/**
 * Fix script for blog posts with empty slugs
 * Run this in production if blogs don't show up due to missing slugs
 * 
 * Usage: npm run ts -- scripts/fix-empty-slugs.ts
 * Or: npx tsx scripts/fix-empty-slugs.ts
 */

import { prisma } from '@/lib/prisma';

const generateSlug = (text?: string) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[ -\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

async function fixEmptySlugs() {
  try {
    console.log('🔍 Scanning for blog posts with empty slugs...');

    // Find all posts with empty slugs
    const postsWithEmptySlugs = await prisma.blogPost.findMany({
      where: {
        OR: [
          { slugEn: '' },
          { slugFr: '' },
        ],
      },
      select: {
        id: true,
        titleEn: true,
        titleFr: true,
        slugEn: true,
        slugFr: true,
      },
    });

    if (postsWithEmptySlugs.length === 0) {
      console.log('✅ No blog posts with empty slugs found!');
      return;
    }

    console.log(`⚠️ Found ${postsWithEmptySlugs.length} blog post(s) with empty slugs:`);

    // Fix each post
    for (const post of postsWithEmptySlugs) {
      console.log(`\n  Processing: ${post.id}`);
      console.log(`    titleEn: ${post.titleEn}`);
      console.log(`    titleFr: ${post.titleFr}`);
      console.log(`    slugEn: "${post.slugEn}" (${post.slugEn.length} chars)`);
      console.log(`    slugFr: "${post.slugFr}" (${post.slugFr.length} chars)`);

      let newSlugEn = post.slugEn;
      let newSlugFr = post.slugFr;

      // Generate slug from title if empty
      if (!newSlugEn || newSlugEn.trim() === '') {
        newSlugEn = generateSlug(post.titleEn) || generateSlug(post.titleFr) || `untitled-${post.id}`;
        console.log(`    → New slugEn: ${newSlugEn}`);
      }

      if (!newSlugFr || newSlugFr.trim() === '') {
        newSlugFr = generateSlug(post.titleFr) || generateSlug(post.titleEn) || `untitled-${post.id}`;
        console.log(`    → New slugFr: ${newSlugFr}`);
      }

      // Update the post
      await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          slugEn: newSlugEn,
          slugFr: newSlugFr,
        },
      });

      console.log('    ✅ Updated');
    }

    console.log(`\n✅ Fixed ${postsWithEmptySlugs.length} blog post(s) with empty slugs!`);
  } catch (error) {
    console.error('❌ Error fixing empty slugs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixEmptySlugs();

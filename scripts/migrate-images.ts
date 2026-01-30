import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const uploadsDir = path.join(__dirname, '../apps/web/public/uploads');

interface ImageMapping {
  oldPath: string;
  newUrl: string;
}

async function uploadFile(localPath: string, storagePath: string): Promise<string | null> {
  try {
    const fileBuffer = fs.readFileSync(localPath);
    const mimeType = localPath.endsWith('.png') ? 'image/png' 
      : localPath.endsWith('.gif') ? 'image/gif'
      : localPath.endsWith('.webp') ? 'image/webp'
      : 'image/jpeg';

    const { error } = await supabase.storage
      .from('uploads')
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error(`Failed to upload ${storagePath}:`, error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(storagePath);

    return publicUrl;
  } catch (err) {
    console.error(`Error uploading ${localPath}:`, err);
    return null;
  }
}

async function migrateFolder(folder: string): Promise<ImageMapping[]> {
  const folderPath = path.join(uploadsDir, folder);
  const mappings: ImageMapping[] = [];

  if (!fs.existsSync(folderPath)) {
    console.log(`Folder ${folder} does not exist, skipping`);
    return mappings;
  }

  const files = fs.readdirSync(folderPath);
  console.log(`Migrating ${files.length} files from ${folder}/`);

  for (const file of files) {
    const localPath = path.join(folderPath, file);
    const stat = fs.statSync(localPath);
    
    if (!stat.isFile()) continue;

    const storagePath = `${folder}/${file}`;
    const oldPath = `/uploads/${folder}/${file}`;
    
    const newUrl = await uploadFile(localPath, storagePath);
    
    if (newUrl) {
      mappings.push({ oldPath, newUrl });
      console.log(`  ✓ ${file}`);
    } else {
      console.log(`  ✗ ${file}`);
    }
  }

  return mappings;
}

async function updateDatabaseUrls(mappings: ImageMapping[]) {
  console.log('\nUpdating database URLs...');

  const tables = [
    { name: 'games', columns: ['cover_image', 'banner_image'] },
    { name: 'news', columns: ['cover_image'] },
    { name: 'team_members', columns: ['profile_image'] },
    { name: 'company_settings', columns: ['value_ko', 'value_en', 'value_ja'] },
  ];

  for (const table of tables) {
    for (const column of table.columns) {
      for (const mapping of mappings) {
        const { error } = await supabase
          .from(table.name)
          .update({ [column]: mapping.newUrl })
          .eq(column, mapping.oldPath);

        if (error && !error.message.includes('0 rows')) {
          console.error(`Error updating ${table.name}.${column}:`, error.message);
        }
      }
    }
  }

  const { data: sections } = await supabase
    .from('game_sections')
    .select('id, images')
    .not('images', 'is', null);

  if (sections) {
    for (const section of sections) {
      if (!section.images?.length) continue;
      
      const updatedImages = section.images.map((img: string) => {
        const mapping = mappings.find(m => m.oldPath === img);
        return mapping ? mapping.newUrl : img;
      });

      await supabase
        .from('game_sections')
        .update({ images: updatedImages })
        .eq('id', section.id);
    }
  }

  console.log('Database URLs updated');
}

async function main() {
  console.log('Starting image migration to Supabase Storage\n');

  const folders = ['games', 'news', 'team_members', 'general', 'press_kits'];
  const allMappings: ImageMapping[] = [];

  for (const folder of folders) {
    const mappings = await migrateFolder(folder);
    allMappings.push(...mappings);
  }

  console.log(`\nMigrated ${allMappings.length} files total`);

  if (allMappings.length > 0) {
    await updateDatabaseUrls(allMappings);
  }

  fs.writeFileSync(
    path.join(__dirname, 'migration-mappings.json'),
    JSON.stringify(allMappings, null, 2)
  );

  console.log('\nMigration complete! Mappings saved to scripts/migration-mappings.json');
}

main().catch(console.error);

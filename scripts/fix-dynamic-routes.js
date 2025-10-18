// Script to add dynamic exports to API routes that use request.url or request.headers
// This prevents Vercel static rendering errors

const fs = require('fs');
const path = require('path');

const apiRoutesNeedingDynamic = [
  'src/app/api/settings/teams/route.ts',
  'src/app/api/settings/teams/members/route.ts', 
  'src/app/api/settings/roles/route.ts',
  'src/app/api/settings/roles/assignments/route.ts',
  'src/app/api/settings/integrations/generic/route.ts',
  'src/app/api/settings/integrations/connections/route.ts',
  'src/app/api/inventory/route.ts',
  'src/app/api/charts/marketplace/route.ts',
  'src/app/api/calendar/events/route.ts',
  'src/app/api/admin/client-config/route.ts'
];

const dynamicExport = "// Force dynamic rendering for this API route\nexport const dynamic = 'force-dynamic';\n\n";

function addDynamicExport(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if dynamic export already exists
    if (content.includes("export const dynamic = 'force-dynamic'")) {
      console.log(`Dynamic export already exists in: ${filePath}`);
      return;
    }

    // Find the first import statement
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Find the end of imports
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        insertIndex = i + 1;
      } else if (lines[i].trim() === '' && insertIndex > 0) {
        insertIndex = i;
        break;
      } else if (!lines[i].startsWith('import ') && insertIndex > 0) {
        insertIndex = i;
        break;
      }
    }

    // Insert dynamic export after imports
    lines.splice(insertIndex, 0, '', '// Force dynamic rendering for this API route', "export const dynamic = 'force-dynamic';");
    
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    console.log(`✅ Added dynamic export to: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('Adding dynamic exports to API routes...\n');

apiRoutesNeedingDynamic.forEach(filePath => {
  addDynamicExport(filePath);
});

console.log('\n✅ Finished adding dynamic exports to API routes!');
console.log('This should fix the Vercel deployment errors.');
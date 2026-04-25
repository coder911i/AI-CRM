const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (!dirFile.includes('node_modules') && !dirFile.includes('.next') && !dirFile.includes('.git') && !dirFile.includes('dist')) {
        filelist = walkSync(dirFile, filelist);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
}

const files = walkSync(path.join(rootDir, 'apps'));
const prismaFiles = walkSync(path.join(rootDir, 'prisma'));
const packagesFiles = walkSync(path.join(rootDir, 'packages'));

const allFiles = [...files, ...prismaFiles, ...packagesFiles];

let report = '# Codebase Scan\n\n';

let apiEndpoints = [];
let reactComponents = [];
let missingImports = [];

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(rootDir, file);
  
  // Basic Regex parsing
  const functionMatches = content.match(/(?:function|const) (\w+)\s*=?\s*(?:async)?\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>?/g);
  const componentMatches = relativePath.includes('apps\\web') && content.match(/export (?:default )?function ([A-Z]\w+)/g);
  const apiCallMatches = content.match(/fetch\(|axios\.|api\./g);
  const authMatches = content.match(/useAuth|jwt|verify|login/g);
  
  let issues = [];
  if (content.includes('// TODO')) issues.push('TODO found');
  if (content.includes('console.log')) issues.push('console.log left in code');
  
  report += `## ${relativePath}\n`;
  report += `- Functions/Components: ${functionMatches ? functionMatches.length : 0}\n`;
  if (componentMatches) report += `- React Components: ${componentMatches.map(m => m.replace(/export (?:default )?function /, '')).join(', ')}\n`;
  if (apiCallMatches) report += `- API Calls: ${apiCallMatches.length} detected\n`;
  if (authMatches) report += `- Auth Usage: Yes\n`;
  if (issues.length) report += `- Issues: ${issues.join(', ')}\n`;
  
  if (content.includes('@Get(') || content.includes('@Post(') || content.includes('router.get(')) {
    apiEndpoints.push(relativePath);
  }
});

report += '\n## Detected Backend API Endpoints (Files)\n' + apiEndpoints.join('\n');

fs.writeFileSync('scan_report.md', report);
console.log(`Scanned ${allFiles.length} files. Report generated.`);

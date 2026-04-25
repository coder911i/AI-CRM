const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
let report = '';

function readFile(filePath) {
    try {
        return fs.readFileSync(path.join(rootDir, filePath), 'utf8');
    } catch (e) {
        return null;
    }
}

// TASK 1: Controllers
const controllers = [
    'apps/api/src/modules/leads/leads.controller.ts',
    'apps/api/src/modules/bookings/bookings.controller.ts',
    'apps/api/src/modules/payments/payments.controller.ts',
    'apps/api/src/modules/projects/projects.controller.ts',
    'apps/api/src/modules/brokers/brokers.controller.ts',
    'apps/api/src/modules/webhooks/webhooks.controller.ts',
    'apps/api/src/modules/units/units.controller.ts'
];
report += '=== TASK 1: CONTROLLERS ===\n';
controllers.forEach(c => {
    const content = readFile(c);
    if (!content) return;
    report += `\n--- ${c} ---\n`;
    const guards = content.match(/@UseGuards\([^)]+\)/g);
    report += `Guards: ${guards ? guards.join(', ') : 'None'}\n`;
    
    const routes = [...content.matchAll(/@(Get|Post|Put|Delete|Patch)\(['"]([^'"]*)['"]\)\n\s*(?:@[\w()]*\n\s*)*\s*(?:async\s*)?\w+\(/g)];
    routes.forEach(r => {
        report += `${r[1]} ${r[2]}\n`;
    });
});

// TASK 2: UI Clusters
const uiFiles = [
    'apps/web/components/CRMLayout.tsx',
    'apps/web/app/pipeline/page.tsx',
    'apps/web/app/leads/page.tsx',
    'apps/web/app/leads/[id]/page.tsx',
    'apps/web/app/inventory/page.tsx',
    'apps/web/app/analytics/page.tsx',
    'apps/web/app/site-visits/page.tsx',
    'apps/web/app/settings/page.tsx'
];
report += '\n=== TASK 2: UI ISSUES ===\n';
uiFiles.forEach(f => {
    const content = readFile(f);
    if (!content) return;
    report += `\n--- ${f} ---\n`;
    const buttons = [...content.matchAll(/<button[^>]*>.*?<\/button>/g)];
    const zIndex = [...content.matchAll(/z-\[\d+\]|z-\d+/g)];
    const fixedAbs = [...content.matchAll(/absolute|fixed/g)];
    const overlays = [...content.matchAll(/bg-black\/\d+|bg-slate-900\/\d+/g)];
    
    report += `Buttons: ${buttons.length}\n`;
    report += `Z-Index classes: ${[...new Set(zIndex.map(m => m[0]))].join(', ')}\n`;
    report += `Positioning: fixed (${fixedAbs.filter(m => m[0] === 'fixed').length}), absolute (${fixedAbs.filter(m => m[0] === 'absolute').length})\n`;
    report += `Overlays: ${[...new Set(overlays.map(m => m[0]))].join(', ')}\n`;
});

// TASK 3: Services
const services = [
    'apps/api/src/modules/leads/leads.service.ts',
    'apps/api/src/modules/analytics/analytics.service.ts',
    'apps/api/src/modules/auth/auth.service.ts',
    'apps/api/src/modules/allocation/allocation.service.ts',
    'apps/api/src/modules/portal/portal.service.ts',
    'apps/api/src/modules/units/units.service.ts',
    'apps/api/src/modules/bookings/bookings.service.ts',
    'apps/api/src/modules/site-visits/site-visits.service.ts',
    'apps/api/src/common/ai/ai.service.ts'
];
report += '\n=== TASK 3: SERVICES ===\n';
services.forEach(s => {
    const content = readFile(s);
    if (!content) return;
    report += `\n--- ${s} ---\n`;
    const methods = [...content.matchAll(/async\s+(\w+)\s*\([^)]*\)\s*{/g)];
    report += `Methods: ${methods.map(m => m[1]).join(', ')}\n`;
});

// TASK 4: Workers
const workers = [
    'apps/api/src/workers/ai-follow-up.worker.ts',
    'apps/api/src/workers/ai-lead-scoring.worker.ts',
    'apps/api/src/workers/visit-reminder.worker.ts',
    'apps/api/src/workers/payment-reminder.worker.ts',
    'apps/api/src/workers/pdf-generator.worker.ts',
    'apps/api/src/workers/daily-briefing.worker.ts',
    'apps/api/src/workers/stale-lead.worker.ts',
    'apps/api/src/workers/unit-hold-expiry.worker.ts',
    'apps/api/src/workers/email.worker.ts',
    'apps/api/src/workers/whatsapp.worker.ts'
];
report += '\n=== TASK 4: WORKERS ===\n';
workers.forEach(w => {
    const content = readFile(w);
    if (!content) {
        report += `\n--- ${w} ---\nFILE NOT FOUND\n`;
        return;
    }
    report += `\n--- ${w} ---\n`;
    const cron = content.match(/@Cron\([^)]+\)/g);
    const process = content.match(/@Process\([^)]*\)/g);
    report += `Triggers: ${cron ? cron.join(', ') : (process ? process.join(', ') : 'None')}\n`;
    const empty = content.trim().length < 100 ? 'Empty/Stub' : 'Has Code';
    report += `Status: ${empty}\n`;
});

// TASK 5: Socket
report += '\n=== TASK 5: SOCKETS ===\n';
const gwContent = readFile('apps/api/src/gateways/events.gateway.ts');
if (gwContent) {
    const listens = [...gwContent.matchAll(/@SubscribeMessage\(['"]([^'"]*)['"]\)/g)];
    const emits = [...gwContent.matchAll(/server\.emit\(['"]([^'"]*)['"]/g)];
    report += `Backend Listens: ${listens.map(m => m[1]).join(', ')}\n`;
    report += `Backend Emits: ${emits.map(m => m[1]).join(', ')}\n`;
}

const socketTsx = readFile('apps/web/lib/socket.tsx');
if (socketTsx) {
    const listens = [...socketTsx.matchAll(/newSocket\.on\(['"]([^'"]*)['"]/g)];
    const emits = [...socketTsx.matchAll(/newSocket\.emit\(['"]([^'"]*)['"]/g)];
    report += `Frontend Listens: ${listens.map(m => m[1]).join(', ')}\n`;
    report += `Frontend Emits: ${emits.map(m => m[1]).join(', ')}\n`;
}

// TASK 6: Auth
report += '\n=== TASK 6: AUTH ===\n';
const authTsx = readFile('apps/web/lib/auth.tsx');
if (authTsx) {
    const storage = [...authTsx.matchAll(/localStorage\.[^()]*\([^)]*\)/g)];
    report += `localStorage usage: ${[...new Set(storage.map(m => m[0]))].join(', ')}\n`;
}

// TASK 7: API Calls
report += '\n=== TASK 7: API CALLS ===\n';
uiFiles.forEach(f => {
    const content = readFile(f);
    if (!content) return;
    const calls = [...content.matchAll(/api\.(get|post|put|delete)\(['"]([^'"]*)['"]/g)];
    if (calls.length > 0) {
        report += `${f}:\n`;
        calls.forEach(c => {
            report += `  - ${c[1].toUpperCase()} ${c[2]}\n`;
        });
    }
});

// TASK 8: Dead Code
const dead = [
    'apps/api/src/modules/agencies/agencies.service.ts',
    'apps/api/src/workers/email.worker.ts',
    'apps/api/src/workers/whatsapp.worker.ts',
    'apps/web/lib/api.ts',
    'packages/shared/index.ts'
];
report += '\n=== TASK 8: DEAD CODE ===\n';
dead.forEach(d => {
    const content = readFile(d);
    if (!content) return;
    report += `${d}: Length ${content.length} chars. Contains: ${content.slice(0, 100).replace(/\n/g, ' ')}\n`;
});

fs.writeFileSync('deep_audit_raw.txt', report);
console.log('Deep audit raw generation complete.');

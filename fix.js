const fs = require('fs');
let p = fs.readFileSync('app/admin/analytics/page.tsx', 'utf8');
p = p.replace('toFixed(1))}%', 'toFixed(1)}%');
p = p.replace('</CareTitle>', '</CardTitle>');
p = p.replace(' className={h-3 w-3 rounded-full ' + '$' + '{item.color}} />', ' className={h-3 w-3 rounded-full ' + '$' + '{item.color}} />');
fs.writeFileSync('app/admin/analytics/page.tsx', p);

let r = fs.readFileSync('app/api/admin/analytics/route.ts', 'utf8');
r = r.replace('=> (' + '$' + '{ ...acc', '=> ({ ...acc');
r = r.replace('groupBy { by: [\'status\']', 'groupBy({ by: [\'status\']');
r = r.replace('groupBy { by: [\'track\']', 'groupBy({ by: [\'track\']');
r = r.replace('groupBy { by: [\'difficulty\']', 'groupBy({ by: [\'difficulty\']');
fs.writeFileSync('app/api/admin/analytics/route.ts', r);
console.log('Fixed!');

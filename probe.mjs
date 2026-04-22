console.log('meta-url   :', import.meta.url);
console.log('argv[1]    :', process.argv[1]);
console.log('expected   :', 'file:///' + process.argv[1].replace(/\\/g, '/'));
console.log('match?     :', import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`);
console.log('match-tri? :', import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`);

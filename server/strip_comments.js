const fs = require('fs');
const path = require('path');

function stripComments(code) {
  let out = [];
  let i = 0;
  const n = code.length;
  let state = 'NORMAL';
  
  while (i < n) {
    const char = code[i];
    if (state === 'NORMAL') {
      if (i + 1 < n && code[i] === '/' && code[i+1] === '*') {
        i += 2;
        while (i + 1 < n && !(code[i] === '*' && code[i+1] === '/')) {
          i++;
        }
        i += 2;
        continue;
      } else if (i + 1 < n && code[i] === '/' && code[i+1] === '/') {
        let lineEnd = code.indexOf('\n', i);
        if (lineEnd === -1) lineEnd = n;
        const commentContent = code.slice(i + 2, lineEnd).trim();
        if (commentContent.startsWith('@ts-ignore')) {
          out.push(code.slice(i, lineEnd));
          i = lineEnd;
        } else {
          i = lineEnd;
        }
        continue;
      } else if (char === "'") {
        state = 'STRING_SINGLE';
        out.push(char);
        i++;
      } else if (char === '"') {
        state = 'STRING_DOUBLE';
        out.push(char);
        i++;
      } else if (char === '`') {
        state = 'STRING_TEMPLATE';
        out.push(char);
        i++;
      } else {
        out.push(char);
        i++;
      }
    } else if (state === 'STRING_SINGLE') {
      if (char === '\\') {
        out.push(code.slice(i, i + 2));
        i += 2;
      } else if (char === "'") {
        state = 'NORMAL';
        out.push(char);
        i++;
      } else {
        out.push(char);
        i++;
      }
    } else if (state === 'STRING_DOUBLE') {
      if (char === '\\') {
        out.push(code.slice(i, i + 2));
        i += 2;
      } else if (char === '"') {
        state = 'NORMAL';
        out.push(char);
        i++;
      } else {
        out.push(char);
        i++;
      }
    } else if (state === 'STRING_TEMPLATE') {
      if (char === '\\') {
        out.push(code.slice(i, i + 2));
        i += 2;
      } else if (char === '`') {
        state = 'NORMAL';
        out.push(char);
        i++;
      } else {
        out.push(char);
        i++;
      }
    }
  }
  return out.join('');
}

// Self-test
const tests = [
  ["const a = 1; // comment\nconst b = 2;", "const a = 1; \nconst b = 2;"],
  ["const a = 1;\n// @ts-ignore\nconst b = 2;", "const a = 1;\n// @ts-ignore\nconst b = 2;"],
  ["const x = 'http://test'; // comment", "const x = 'http://test'; "],
  ["const x = 1; /* multiline\ncomment */ const y = 2;", "const x = 1;  const y = 2;"]
];

let failed = false;
for (const [inp, expected] of tests) {
  const result = stripComments(inp);
  if (result !== expected) {
    console.error(`Self-test failed!\nInput: ${JSON.stringify(inp)}\nGot: ${JSON.stringify(result)}\nExpected: ${JSON.stringify(expected)}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
console.log("Self-tests passed. Walking directory...");

const serverSrc = path.join(__dirname, 'src');
console.log("Target directory:", serverSrc);

function walk(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const cleaned = stripComments(content);
      if (cleaned !== content) {
        fs.writeFileSync(filePath, cleaned, 'utf8');
        console.log("Stripped comments from:", path.relative(serverSrc, filePath));
      }
    }
  }
}

walk(serverSrc);
console.log("Done!");

#!/usr/bin/env node

/**
 * Rainmaker Arena - Deployment Verification Script
 * Checks if the project is ready for Vercel deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Rainmaker Arena - Deployment Verification\n');

const checks = [
  {
    name: 'package.json exists',
    check: () => fs.existsSync('package.json'),
    required: true
  },
  {
    name: 'next.config.ts configured',
    check: () => fs.existsSync('next.config.ts'),
    required: true
  },
  {
    name: 'vercel.json configured',
    check: () => fs.existsSync('vercel.json'),
    required: true
  },
  {
    name: 'tsconfig.json exists',
    check: () => fs.existsSync('tsconfig.json'),
    required: true
  },
  {
    name: 'Prisma schema exists',
    check: () => fs.existsSync('prisma/schema.prisma'),
    required: true
  },
  {
    name: '.next build folder exists',
    check: () => fs.existsSync('.next'),
    required: true
  },
  {
    name: 'node_modules installed',
    check: () => fs.existsSync('node_modules'),
    required: true
  },
  {
    name: 'src/app directory structure',
    check: () => fs.existsSync('src/app') && fs.existsSync('src/app/page.tsx'),
    required: true
  },
  {
    name: 'API routes exist',
    check: () => fs.existsSync('src/app/api'),
    required: true
  },
  {
    name: 'Components directory',
    check: () => fs.existsSync('src/components'),
    required: true
  },
  {
    name: 'Deployment guide exists',
    check: () => fs.existsSync('DEPLOYMENT.md'),
    required: false
  }
];

let passedChecks = 0;
let requiredChecks = 0;

checks.forEach(({ name, check, required }) => {
  const status = check();
  const icon = status ? '✅' : '❌';
  const req = required ? '[REQUIRED]' : '[OPTIONAL]';
  
  console.log(`${icon} ${name} ${req}`);
  
  if (status) passedChecks++;
  if (required) requiredChecks++;
});

console.log('\n📊 Summary:');
console.log(`✅ Passed: ${passedChecks}/${checks.length} checks`);
console.log(`🔥 Required: ${requiredChecks}/${checks.filter(c => c.required).length} passed`);

const readyForDeployment = checks.filter(c => c.required).every(c => c.check());

if (readyForDeployment) {
  console.log('\n🎉 PROJECT IS READY FOR VERCEL DEPLOYMENT!');
  console.log('\n📚 Next steps:');
  console.log('1. Push to GitHub repository');
  console.log('2. Connect to Vercel');
  console.log('3. Add environment variables (see DEPLOYMENT.md)');
  console.log('4. Deploy to production');
  console.log('\n🚀 Deploy command: vercel --prod');
} else {
  console.log('\n⚠️  Some required checks failed. Please fix them before deployment.');
}

console.log('\n📖 For detailed deployment instructions, see DEPLOYMENT.md'); 
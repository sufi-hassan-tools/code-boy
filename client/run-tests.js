const { execSync } = require('child_process');

console.log('Running tests with coverage...');

try {
  const result = execSync('npx jest --coverage --watchAll=false --maxWorkers=1 --testTimeout=30000', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log(result);
} catch (error) {
  console.error('Test execution failed:', error.message);
  if (error.stdout) {
    console.log('STDOUT:', error.stdout);
  }
  if (error.stderr) {
    console.log('STDERR:', error.stderr);
  }
}
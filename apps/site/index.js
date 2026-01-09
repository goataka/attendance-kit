// Site Application Entry Point
import { fileURLToPath } from 'url';

console.log('Site application initialized');

export default function main() {
  console.log('Site main function called');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}

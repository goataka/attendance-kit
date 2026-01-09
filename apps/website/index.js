// Website Application Entry Point
import { fileURLToPath } from 'url';

console.log('Website application initialized');

export default function main() {
  console.log('Website main function called');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}

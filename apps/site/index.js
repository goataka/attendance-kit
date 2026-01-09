// Site Application Entry Point
console.log('Site application initialized');

export default function main() {
  console.log('Site main function called');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

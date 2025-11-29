
import { auth } from "./lib/auth";

async function main() {
  console.log("Auth imported successfully");
  try {
    console.log("Auth object keys:", Object.keys(auth));
  } catch (error) {
    console.error("Error accessing auth:", error);
  }
}

main();

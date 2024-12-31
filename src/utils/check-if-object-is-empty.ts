export function checkIfObjectIsEmpty(obj: Object): boolean {
  for (const key in obj) {
    return false
  }
  return true
}

export function useLocalStorage() {
  const load = (key, fallback) => {
    return JSON.parse(localStorage.getItem(key)) || fallback
  }

  const save = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
  }

  return { load, save }
}

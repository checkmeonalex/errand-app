import { useEffect, useRef, useState } from 'react';
import { loadJSON, removeKey, saveJSON, type StorageKey } from '../storage/storage';

// A list saved on the device under one storage key: load on launch, add
// items, wipe everything. Changes build on the latest saved copy, so two
// quick adds can't overwrite each other or what was saved before launch.
export function usePersistentList<T>(key: StorageKey) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsRef = useRef<T[]>([]);
  const loaded = useRef<Promise<void> | null>(null);

  useEffect(() => {
    loaded.current = loadJSON<T[]>(key).then((saved) => {
      itemsRef.current = saved ?? [];
      setItems(itemsRef.current);
      setIsLoading(false);
    });
  }, [key]);

  async function add(item: T) {
    await loaded.current;
    itemsRef.current = [item, ...itemsRef.current];
    setItems(itemsRef.current);
    await saveJSON(key, itemsRef.current);
  }

  async function clearAll() {
    await loaded.current;
    itemsRef.current = [];
    setItems([]);
    await removeKey(key);
  }

  return { items, isLoading, add, clearAll };
}

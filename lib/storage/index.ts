import { mockStorage } from "@/lib/storage/mock-storage";
import { shelbyStorage } from "@/lib/storage/shelby-storage";
import type { StorageAdapter, StorageProviderName } from "@/lib/storage/types";

export function getStorageMode(): StorageProviderName {
  return process.env.NEXT_PUBLIC_STORAGE_PROVIDER === "shelby"
    ? "shelby"
    : "mock";
}

export function getStorageProvider(): StorageAdapter {
  return getStorageMode() === "shelby" ? shelbyStorage : mockStorage;
}

export function getStorageModeLabel() {
  return getStorageMode() === "shelby"
    ? "Shelby storage mode"
    : "Mock storage mode";
}

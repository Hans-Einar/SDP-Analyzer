/**
 * Adapter-local structural types for the read-only File System Access members
 * used by SLC-008. Native browser handles satisfy these contracts without
 * making browser types part of the core ProjectSource boundary.
 */
export interface BrowserFileSystemHandle {
  readonly kind: string;
  readonly name: string;
}

export interface BrowserFile {
  text(): Promise<string>;
}

export interface BrowserFileSystemFileHandle extends BrowserFileSystemHandle {
  readonly kind: "file";
  getFile(): Promise<BrowserFile>;
}

export interface BrowserReadPermissionDescriptor {
  readonly mode: "read";
}

export interface BrowserFileSystemDirectoryHandle
  extends BrowserFileSystemHandle {
  readonly kind: "directory";
  entries(): AsyncIterable<[string, BrowserFileSystemHandle]>;
  queryPermission?(
    descriptor: BrowserReadPermissionDescriptor,
  ): Promise<string>;
}

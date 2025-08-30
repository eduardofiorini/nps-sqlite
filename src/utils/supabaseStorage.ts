// Re-export everything from nodeStorage for backward compatibility
export * from './nodeStorage';

// Deprecated: Use nodeStorage instead
console.warn('supabaseStorage is deprecated. Use nodeStorage instead.');
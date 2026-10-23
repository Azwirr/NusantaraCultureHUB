// Cache tag for every cached read of public (approved) content. Review
// actions that change what is public expire it, so the next visit sees the
// change. Client-safe constant.
export const CONTENT_TAG = "public-content";

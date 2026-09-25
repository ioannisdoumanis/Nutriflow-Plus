window.__DATA__ = __DEMO_DATA__;
window.claude = { use: async (n) => {
  const D = window.__DATA__;
  if (n === 'db') return {
    collection: (col) => ({ limit(){ return this; }, onSnapshot: (cb) => { setTimeout(() => { const docs = Object.entries(D[col] || {}).map(([id, b]) => ({ id, data: () => b })); cb({ docs }); }, 50); return () => {}; } }),
    doc: (p) => ({ set: async () => {}, update: async () => {}, delete: async () => {} })
  };
  if (n === 'user') return { me: async () => ({ name: 'Giannis Doumanis', avatarUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2230%22 height=%2230%22%3E%3Crect width=%2230%22 height=%2230%22 fill=%22%23A394FF%22/%3E%3C/svg%3E', isOwner: true }), can: async () => true };
  return null;
}};

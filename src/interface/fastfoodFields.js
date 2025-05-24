// interfaces/order.js
exports.FastfoodFields = {
  id: { type: 'string', required: false },
  userId: { type: 'string', required: true },
  status: { type: 'bool', required: false },
  name: { type: 'string', required: true },
};

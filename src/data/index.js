const data = {
  "nodes": [
    { "node": 0, "name": "Node 0" },
    { "node": 1, "name": "Node 1" },
    { "node": 2, "name": "Node 2" },
    { "node": 3, "name": "Node 3" },
    { "node": 4, "name": "Node 4" },
    { "node": 5, "name": "Node 5" },
    // { "node": 6, "name": "Node 6" }
  ],
  "links": [
    { "source": 0, "target": 1, "value": 1 },
    { "source": 0, "target": 2, "value": 1 },
    { "source": 0, "target": 3, "value": 1 },
    { "source": 4, "target": 5, "value": 1 }, // 全新節點
    // { "source": 5, "target": 4, "value": 1 }, // 子層
    // { "source": 2, "target": 1, "value": 1 },
    // { "source": 4, "target": 5, "value": 1 },
    // { "source": 2, "target": 5, "value": 1 },
    // { "source": 0, "target": 3, "value": 1 },
  ]
};

export default data;
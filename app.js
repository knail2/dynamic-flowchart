// app.js

// 1. Fetch the data from data.json
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    // data is in a NetworkX-like JSON: { nodes: [...], links: [...], etc. }

    // 2. Transform the data into Cytoscape's elements array
    const nodes = data.nodes.map(node => ({
      data: { id: node.id, label: node.label }
    }));

    const edges = data.links.map(link => ({
      data: { source: link.source, target: link.target }
    }));

    const elements = [...nodes, ...edges];

    // 3. Initialize cytoscape with the given elements
    const cy = cytoscape({
      container: document.getElementById('cy'), // the dom element
      elements: elements,

      style: [
        {
          selector: 'node',
          style: {
            'content': 'data(label)',
            'background-color': '#666',
            'text-valign': 'center',
            'color': '#fff',
            'width': '40px',
            'height': '40px'
          }
        },
        {
          selector: 'edge',
          style: {
            'line-color': '#aaa',
            'width': 2,
            'target-arrow-color': '#aaa',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        }
      ],

      layout: {
        name: 'grid',
        rows: 2
      }
    });
  })
  .catch(error => console.error('Error loading the graph data:', error));


document.addEventListener('DOMContentLoaded', () => {
  const cyContainer = document.getElementById('cy');
  const logsContainer = document.getElementById('logs');
  const renderGraphBtn = document.getElementById('render-graph');
  const convertCsvBtn = document.getElementById('convert-csv');
  const categorySelect = document.getElementById('oncology-category');

  let cy;

  const logMessage = (message) => {
    const logEntry = document.createElement('div');
    logEntry.textContent = message;
    logsContainer.appendChild(logEntry);
    console.log(message);
  };

  function isHidden(id) {
    return cy.getElementById(id).hasClass('hidden');
  }

  function show(id) {
    cy.getElementById(id).removeClass('hidden');
    logMessage(`Showing node or edge: ${id}`);
  }

  function hide(id) {
    cy.getElementById(id).addClass('hidden');
    logMessage(`Hiding node or edge: ${id}`);
  }

  function toggleVisibility(id) {
    if (isHidden(id)) {
      show(id);
    } else {
      hide(id);
    }
  }

  function setNodeColor(node, fill, outline) {
    node.style('background-color', fill);
    node.style('border-color', outline);
  }

  const toggleDownstream = (nodeId) => {
    logMessage(`Toggling downstream nodes for: ${nodeId}`);

    const hideAllDescendants = (id) => {
      const connectedEdges = cy.edges(`[source = "${id}"]`);
      connectedEdges.forEach(edge => {
        const targetNode = edge.target();
        edge.addClass('hidden');
        logMessage(`Hiding edge: ${edge.id()}`);
        targetNode.addClass('hidden');
        logMessage(`Hiding node: ${targetNode.id()}`);
        hideAllDescendants(targetNode.id());
      });
    };

    const connectedEdges = cy.edges(`[source = "${nodeId}"]`);
    if (isHidden(connectedEdges[0]?.id())) {
      connectedEdges.forEach(edge => {
        const targetNode = edge.target();
        edge.removeClass('hidden');
        logMessage(`Showing edge: ${edge.id()}`);
        targetNode.removeClass('hidden');
        logMessage(`Showing node: ${targetNode.id()}`);
      });
    } else {
      hideAllDescendants(nodeId);
    }
  };

  const filterByCategory = (data, category) => {
    if (category === 'All') {
      // Show only oncology_category nodes for "All"
      data.elements.nodes.forEach(node => {
        if (node.data.type === 'oncology_category') {
          node.data.label = node.data.label.replace(/\//g, '/ ');
          delete node.classes;
        } else {
          node.classes = 'hidden';
        }
      });
      data.elements.edges.forEach(edge => {
        edge.classes = 'hidden';
      });
      return data;
    }

    if (category === 'All_fully_expanded') {
      // Show everything for "All Fully Expanded"
      data.elements.nodes.forEach(node => {
        node.data.label = node.data.label.replace(/\//g, '/ ');
        delete node.classes;
      });
      data.elements.edges.forEach(edge => {
        delete edge.classes;
      });
      return data;
    }

    const filteredNodes = new Set();
    const filteredEdges = [];

    let categoryName = category.replace('_', '/');
    if (category === 'Tumor_Agnostic') {
      categoryName = 'Tumor Agnostic';
    }

    data.elements.edges.forEach(edge => {
      if (edge.data.source.includes(categoryName)) {
        filteredEdges.push(edge);
        filteredNodes.add(edge.data.source);
        filteredNodes.add(edge.data.target);
      }
    });

    data.elements.nodes.forEach(node => {
      if (filteredNodes.has(node.data.id)) {
        node.data.label = node.data.label.replace(/\//g, '/ ');
        delete node.classes;
      } else {
        node.classes = 'hidden';
      }
    });

    data.elements.edges.forEach(edge => {
      if (!filteredEdges.includes(edge)) {
        edge.classes = 'hidden';
      } else {
        delete edge.classes;
      }
    });

    return data;
  };

  const renderGraph = (data, category) => {
    logMessage('Local JSON Data: ' + JSON.stringify(data, null, 2));

    if (!data || !data.elements || !data.elements.nodes || !data.elements.edges) {
      logMessage('Error: Invalid data received.');
      return;
    }

    const filteredData = filterByCategory(data, category);

    cy = cytoscape({
      container: cyContainer,
      elements: filteredData.elements,
      style: [
        {
          selector: 'node',
          style: {
            'shape': 'round-rectangle',
            'background-color': 'data(color)',
            'border-color': 'data(outline)',
            'label': 'data(label)',
            'text-valign': 'center',
            'font-size': '12px',
            'padding': '10px',
            'width': 100,
            'height': 40,
            'text-wrap': 'wrap',
            'text-max-width': '90px',
            'color': '#000',
            'border-width': 1
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#ccc',
            'arrow-scale': 1.2,
            'curve-style': 'bezier'
          }
        },
        {
          'selector': '.hidden',
          'style': {
            'display': 'none'
          }
        }
      ],
      layout: {
        name: 'dagre',
        rankDir: 'LR',
        nodeSep: 20,
        edgeSep: 10,
        rankSep: 20
      }
    });

    cy.on('mouseover', 'node[type="trial_code"]', function (evt) {
      const node = evt.target;
      const description = node.data('description');
      const tooltip = document.createElement('div');
      tooltip.id = 'tooltip';
      tooltip.textContent = description;
      tooltip.style.position = 'absolute';
      tooltip.style.left = evt.originalEvent.pageX + 'px';
      tooltip.style.top = evt.originalEvent.pageY + 'px';
      tooltip.style.padding = '5px';
      tooltip.style.backgroundColor = '#fff';
      tooltip.style.border = '1px solid #000';
      tooltip.style.zIndex = 1000;
      tooltip.style.fontSize = '10px'; // Reduced font size by 2 points
      document.body.appendChild(tooltip);
    });

    cy.on('mouseout', 'node[type="trial_code"]', function () {
      const tooltip = document.getElementById('tooltip');
      if (tooltip) {
        tooltip.remove();
      }
    });

    cy.on('cxttap', 'node[type="trial_code"]', function () {
      const hyperlink = this.data('hyperlink');
      if (hyperlink) {
        window.open(hyperlink, '_blank');
      }
    });

    cy.on('tap', 'node', (evt) => {
      const nodeId = evt.target.id();
      logMessage(`Node clicked: ${nodeId}`);

      const clickedNode = cy.getElementById(nodeId);

      if (clickedNode) {
        logMessage(`Handling click for node: ${nodeId}`);

        const shouldHide = !isHidden(cy.edges(`[source = "${nodeId}"]`)[0]?.id());

        const hideAllDescendants = (id) => {
          const connectedEdges = cy.edges(`[source = "${id}"]`);
          connectedEdges.forEach(edge => {
            const targetNode = edge.target();
            edge.addClass('hidden');
            logMessage(`Hiding edge: ${edge.id()}`);
            targetNode.addClass('hidden');
            logMessage(`Hiding node: ${targetNode.id()}`);
            hideAllDescendants(targetNode.id());
          });
        };

        if (shouldHide) {
          hideAllDescendants(nodeId);
        } else {
          const connectedEdges = cy.edges(`[source = "${nodeId}"]`);
          connectedEdges.forEach(edge => {
            const targetNode = edge.target();
            edge.removeClass('hidden');
            logMessage(`Showing edge: ${edge.id()}`);
            targetNode.removeClass('hidden');
            logMessage(`Showing node: ${targetNode.id()}`);
          });
        }
      }
    });

    logMessage('Updated Cytoscape Data: ' + JSON.stringify(filteredData.elements, null, 2));
  };

  renderGraphBtn.addEventListener('click', () => {
    const category = categorySelect.value;
    logMessage(`Rendering graph for category: ${category}`);

    fetch('mpop-tidytable.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        renderGraph(data, category);
      })
      .catch((err) => {
        logMessage(`Error rendering graph: ${err.message}`);
      });
  });

  convertCsvBtn.addEventListener('click', () => {
    logMessage('CSV-to-JSON functionality is unavailable in local-only mode.');
  });
});

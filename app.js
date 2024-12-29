document.addEventListener('DOMContentLoaded', function() {
  // Fetch the data from data.json
  fetch('data.json')
    .then(response => response.json())
    .then(json => {
      // Initialize Cytoscape with style and elements from data.json
      const cy = cytoscape({
        container: document.getElementById('cy'),
        style: json.style,          // <--- style from data.json
        elements: json.elements,    // <--- elements from data.json
        layout: {
          name: 'dagre',
          rankDir: 'LR'  // Left-to-right layout
        }
      });

      // Helper: show or hide elements by removing/adding the 'hidden' class
      function showElementById(id) {
        cy.getElementById(id).removeClass('hidden');
      }
      function hideElementById(id) {
        cy.getElementById(id).addClass('hidden');
      }

      // Helper: change node style (fill/outline)
      function styleNode(node, fillColor, outlineColor) {
        node.style('background-color', fillColor);
        node.style('border-color', outlineColor);
      }

      // On click of Node A
      cy.on('tap', 'node[id = "A"]', function(evt) {
        const nodeA = evt.target;
        
        // Change Node A to sea blue fill, navy blue outline
        styleNode(nodeA, '#5bc0de', '#001f3f');

        // Reveal Node B and edges A->B, X->B
        showElementById('B');
        showElementById('A-B');
        showElementById('X-B');

        // Style A->B edge as navy
        cy.getElementById('A-B').style({
          'line-color': '#001f3f',
          'target-arrow-color': '#001f3f'
        });

        // Style Node B as light blue fill, UNC blue outline
        const nodeB = cy.getElementById('B');
        styleNode(nodeB, '#add8e6', '#2b68c1');

        // Rerun layout
        cy.layout({ name: 'dagre', rankDir: 'LR' }).run();
      });

      // On click of Node B
      cy.on('tap', 'node[id = "B"]', function(evt) {
        const nodeB = evt.target;

        // Change Node B to sea blue fill, navy outline
        styleNode(nodeB, '#5bc0de', '#001f3f');

        // Reveal C, D, E + edges B->C, B->D, B->E
        showElementById('C');
        showElementById('D');
        showElementById('E');
        showElementById('B-C');
        showElementById('B-D');
        showElementById('B-E');

        // Rerun layout
        cy.layout({ name: 'dagre', rankDir: 'LR' }).run();
      });

      // ----- Tooltip logic for C, D, E ------
      // We'll create a function that attaches a Tippy.js tooltip to each of these nodes.
      function addTooltip(node) {
        const ref = node.popperRef();
        const tooltip = tippy(document.createElement('div'), {
          content: `
            <div class="tooltip-content" style="font-size:0.75rem;">
              Lorem Ipsum<br>
              <a href="https://google.com" target="_blank">https://google.com</a>
            </div>`,
          allowHTML: true,
          trigger: 'manual',
          interactive: true
        });
        node.on('mouseover', () => {
          tooltip.setProps({ getReferenceClientRect: ref.getBoundingClientRect });
          tooltip.show();
        });
        node.on('mouseout', () => {
          tooltip.hide();
        });
      }

      // Attach tooltips to nodes C, D, E
      ['C', 'D', 'E'].forEach(id => {
        const node = cy.getElementById(id);
        addTooltip(node);
      });
    })
    .catch(error => {
      console.error('Error loading data.json:', error);
    });
});

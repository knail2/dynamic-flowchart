document.addEventListener('DOMContentLoaded', function() {
  // Fetch the JSON containing style, elements, and tooltips
  //cytoscape.use(cytoscapePopper);
  fetch('data.json')
    .then(response => response.json())
    .then(json => {
      // 1) Initialize Cytoscape with style & elements from data.json
      //cytoscape.use(cytoscapePopper);
      const cy = cytoscape({
        container: document.getElementById('cy'),
        style: json.style,
        elements: json.elements,
        layout: {
          name: 'dagre',
          rankDir: 'LR'
        }
      });

      // 2) Toggling logic for Node A and Node B
      function isHidden(id) {
        return cy.getElementById(id).hasClass('hidden');
      }
      function show(id) {
        cy.getElementById(id).removeClass('hidden');
      }
      function hide(id) {
        cy.getElementById(id).addClass('hidden');
      }
      function setNodeColor(node, fill, outline) {
        node.style('background-color', fill);
        node.style('border-color', outline);
      }

      // ---- Click Node A: toggle Node B (and children if collapsed) ----
      cy.on('tap', 'node[id="A"]', () => {
        const nodeA = cy.getElementById('A');
        const nodeB = cy.getElementById('B');

        if (isHidden('B')) {
          // Expand
          setNodeColor(nodeA, '#5bc0de', '#001f3f'); // sea blue + navy
          show('B');
          show('A-B');
          show('X-B');
          // Edge A->B is navy
          cy.getElementById('A-B').style({
            'line-color': '#001f3f',
            'target-arrow-color': '#001f3f'
          });
          // B = light blue + UNC
          setNodeColor(nodeB, '#add8e6', '#2b68c1');
        } else {
          // Collapse
          setNodeColor(nodeA, '#ccc', '#000'); // revert to grey
          hide('B');
          hide('A-B');
          hide('X-B');
          // Also hide B's children
          hide('C'); hide('B-C');
          hide('D'); hide('B-D');
          hide('E'); hide('B-E');
          setNodeColor(nodeB, '#ccc', '#000'); 
        }
        // Re-run layout
        cy.layout({ name: 'dagre', rankDir: 'LR' }).run();
      });

      // ---- Click Node B: toggle C, D, E ----
      cy.on('tap', 'node[id="B"]', () => {
        const nodeB = cy.getElementById('B');

        if (isHidden('C')) {
          // Expand
          setNodeColor(nodeB, '#5bc0de', '#001f3f');
          show('C'); show('B-C');
          show('D'); show('B-D');
          show('E'); show('B-E');
        } else {
          // Collapse
          setNodeColor(nodeB, '#add8e6', '#2b68c1');
          hide('C'); hide('B-C');
          hide('D'); hide('B-D');
          hide('E'); hide('B-E');
        }
        cy.layout({ name: 'dagre', rankDir: 'LR' }).run();
      });

      // 3) Tooltips for Leaf Nodes
      // We'll assume "C, D, E" might have custom tooltip content in json.tooltips
      // We create a fresh Tippy on mouseover, destroy it on mouseout
      cy.on('mouseover', 'node[id="C"], node[id="D"], node[id="E"]', evt => {
        const node = evt.target;
        const nodeId = node.id();
        const contentHtml = json.tooltips[nodeId] || 'No tooltip text';

        // popperRef for positioning
        const ref = node.popperRef();
        // Create new Tippy
        const tip = tippy(document.createElement('div'), {
          allowHTML: true,
          content: `<div class="tooltip-content" style="font-size:0.75rem;">
                      ${contentHtml}
                    </div>`,
          trigger: 'manual',
          interactive: true,
          appendTo: document.body
        });

        // Position & show
        tip.setProps({
          getReferenceClientRect: ref.getBoundingClientRect
        });
        tip.show();

        // Hide on mouseout, then destroy
        node.on('mouseout', () => {
          tip.hide();
          tip.destroy();
        }, { once: true }); 
      });

      // Done! The graph is ready, with toggling & tooltips from data.json
    })
    .catch(err => {
      console.error('Error fetching/using data.json:', err);
    });
});

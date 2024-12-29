
# Cytoscape NetworkX Example

This repository contains a minimal example of visualizing a graph in **Cytoscape.js** using a **NetworkX-compatible** JSON file (`data.json`).

## Getting Started

1. **Clone or download** this repository to your local machine:
   ```bash
   git clone https://github.com/your-username/my-cytoscape-project.git
   ```
   Or simply download and extract the ZIP file from GitHub.

2. **Install a local development server with auto-reload.** There are two common approaches:

   ### Option A: Using `npm install --save-dev` and `npx` (no root permissions needed)
   
   1. Ensure you have [Node.js](https://nodejs.org/) installed.  
   2. In your project folder, initialize an npm project if you haven’t already:
      ```bash
      cd my-cytoscape-project
      npm init -y
      ```
   3. Install **live-server** as a dev dependency:
      ```bash
      npm install live-server --save-dev
      ```
   4. Start **live-server** via `npx`:
      ```bash
      npx live-server
      ```
      This will open your browser at `http://127.0.0.1:8080`, loading `index.html`.
      
   ### Option B: Using a global live-server or other tools (may require root, unless using nvm)
   
   - **live-server** (globally):
     ```bash
     npm install -g live-server
     live-server
     ```
   - **browser-sync** (globally):
     ```bash
     npm install -g browser-sync
     browser-sync start --server --files "index.html, app.js, data.json"
     ```

3. **Open the URL** in your browser, typically `http://127.0.0.1:8080` or whichever port is used.  
4. You should see the Cytoscape graph with nodes and edges defined in `data.json`.

## Updating the Graph

- If you edit `data.json` or any of the files, the page should automatically reload if using **live-server** or **browser-sync**. Otherwise, you can manually refresh the page.

## Hosting on GitHub Pages

You can easily host this static site on **GitHub Pages**:

1. Commit your changes and push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
2. Go to your repository **Settings** on GitHub.  
3. Under **"Pages"** (or **"Pages and Branches"**), select the **branch** you want to deploy from (typically `main`) and choose the root folder (`/`).  
4. Wait a few seconds; GitHub Pages will provide a URL like:
   ```
   https://your-username.github.io/my-cytoscape-project/
   ```
5. Navigate to that URL, and you’ll see your app!

> **Note**: Because everything is static and in the same repository, you shouldn’t run into cross-origin request issues. However, if you do, consider placing all static data and files in the same GitHub Pages environment.
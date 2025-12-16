
// Vercel Serverless Function (Node.js)
// This file runs on the server, keeping your GITHUB_TOKEN secure.
const { Octokit } = require("@octokit/rest");

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { files, message, accessKey } = req.body;

  // 1. Security Check
  if (accessKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ message: 'Unauthorized: Invalid Access Key' });
  }

  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO || !process.env.GITHUB_OWNER) {
    return res.status(500).json({ message: 'Server Configuration Error: Missing Env Vars' });
  }

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = 'main'; // Target branch

  try {
    // 2. Commit Logic
    // We iterate through the files (e.g., zh.md and en.md) and commit them.
    // In a real high-concurrency scenario, you'd use a Tree API to commit multiple files at once.
    // For a personal blog, sequential commits or simple updates are fine.
    
    for (const file of files) {
      const { path, content } = file;

      // Check if file exists to get its SHA (required for updates)
      let sha;
      try {
        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path,
          ref: branch,
        });
        sha = data.sha;
      } catch (e) {
        // File doesn't exist, which is fine for new posts
      }

      // Create or Update File
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: message || `research(log): update ${path}`,
        content: Buffer.from(content).toString('base64'),
        sha, // If omitted, GitHub creates a new file. If provided, GitHub updates it.
        branch,
      });
    }

    return res.status(200).json({ success: true, message: 'Content committed to repository.' });

  } catch (error) {
    console.error("GitHub API Error:", error);
    return res.status(500).json({ message: error.message });
  }
}

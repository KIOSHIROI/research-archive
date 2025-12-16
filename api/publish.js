
// Vercel Serverless Function (Node.js)
import { Octokit } from "@octokit/rest";

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
  const branch = 'main'; 

  try {
    for (const file of files) {
      const { path, content, isBinary } = file;

      // Check if file exists to get SHA
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
        // File doesn't exist
      }

      // Prepare content: strictly Base64
      // If isBinary is true, we assume 'content' is ALREADY a base64 string (without data:image/... prefix)
      // If isBinary is false, we convert the UTF-8 string to Base64
      const contentBase64 = isBinary 
        ? content 
        : Buffer.from(content).toString('base64');

      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: message || `research(log): update ${path}`,
        content: contentBase64,
        sha,
        branch,
      });
    }

    return res.status(200).json({ success: true, message: 'Content committed to repository.' });

  } catch (error) {
    console.error("GitHub API Error:", error);
    return res.status(500).json({ message: error.message });
  }
}

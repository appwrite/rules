/**
 * MCP Server recommendation content
 * This content is included in all generated rules to recommend installing the Appwrite Docs MCP server
 */

/**
 * MCP Server recommendation section
 * @returns {string}
 */
export function generateMCPRecommendation() {
	return `## Recommended: Install Appwrite Docs MCP Server

**We highly recommend installing the Appwrite Docs MCP server** to get instant access to Appwrite documentation, code examples, and best practices directly in Cursor. This enables the AI assistant to provide accurate, up-to-date Appwrite guidance and code examples.

### Installation Steps

1. **Open Cursor Settings**
   - Go to **Cursor Settings** → **MCP** tab
   - Click **Add new global MCP server**

2. **Add the Docs Server**
   - Update the \`mcp.json\` file with the following configuration:

\`\`\`json
{
  "mcpServers": {
    "appwrite-docs": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mcp-for-docs.appwrite.io"
      ]
    }
  }
}
\`\`\`

3. **Save and Restart**
   - Save the \`mcp.json\` file
   - Restart Cursor if the MCP server doesn't start automatically

### Benefits

Once installed, you can ask questions like:
- "How do I set up real-time subscriptions in Appwrite?"
- "Show me how to authenticate users with OAuth"
- "What are the best practices for database queries?"
- "How do I implement file uploads with Appwrite Storage?"
- "Show me an example of using Appwrite Functions"

**Note:** You can also install the Appwrite API MCP server for direct API interactions. For full setup instructions, visit: https://appwrite.io/docs/tooling/mcp/cursor

---`;
}


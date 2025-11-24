
export const handleGenerateContent = async (
  projectSummary: string,
  projectId: string
) => {
  if (!projectSummary.trim() || !projectId.trim()) return;

  try {
    // Use fetch to call your API route
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-project-id": projectId, // pass project ID in header
        // Optionally include your auth token here if needed:
        // "Authorization": `Bearer ${userToken}`,
      },
      body: JSON.stringify({ userPrompt: projectSummary }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Generating tasks failed");
    }

    return data;
  } catch (err: any) {
    console.error("Generate Content Error:", err);
    return null;
  }
};


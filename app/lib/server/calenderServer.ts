export default async function getCalender() {
    try
    {const res = await fetch(
      `/api/calender`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
         
        },
        cache: "no-store",
      }
    );
   const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to calender");
    }
    return data;
  } catch (error) {
    console.error("Get calender error:", error);
    return null;
  }
}
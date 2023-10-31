export async function upload(content: any) : Promise<string> {
    const json = await fetch(`${import.meta.env.VITE_WEBSERVER}/upload`, {
        method: "POST",
        body: content,
      }).then((response) => response.json());
    return json.url;
}
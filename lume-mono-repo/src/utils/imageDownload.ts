const handleDownload = (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = imageUrl.split("/").pop() || "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

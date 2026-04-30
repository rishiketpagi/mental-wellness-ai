export async function uploadProfilePicture(file) {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "calmora/profile-pictures");

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error("Cloudinary upload failed");
    }

    const data = await response.json();
    return data.secure_url;
}
// 1. Initialize Supabase
const supabaseUrl = 'YOUR_PROJECT_URL_HERE';
const supabaseKey = 'YOUR_ANON_KEY_HERE';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const galleryGrid = document.getElementById('galleryGrid');
const statusText = document.getElementById('uploadStatus');

// 2. Fetch and Display Gallery on Load
async function fetchGallery() {
    galleryGrid.innerHTML = '<p>Loading photos...</p>';
    
    // Fetch photos, newest first
    const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching gallery:", error);
        galleryGrid.innerHTML = '<p>Error loading photos.</p>';
        return;
    }

    galleryGrid.innerHTML = ''; // Clear loading text

    if (data.length === 0) {
        galleryGrid.innerHTML = '<p>No photos in the gallery yet.</p>';
        return;
    }

    // Generate HTML for each photo
    data.forEach(photo => {
        const card = document.createElement('div');
        card.className = 'admin-card';
        card.innerHTML = `
            <img src="${photo.image_url}" alt="${photo.description || 'Gallery image'}">
            <div class="admin-card-info">
                <h4>${photo.category}</h4>
                <p>${photo.description || 'No description'}</p>
            </div>
            <button class="delete-btn" onclick="deletePhoto(${photo.id}, '${photo.image_url}')">Delete Photo</button>
        `;
        galleryGrid.appendChild(card);
    });
}

// 3. Handle the Upload Form
document.getElementById('uploadForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];

    if (!file) return;

    statusText.innerText = "Uploading to server...";
    document.getElementById('uploadBtn').disabled = true;

    try {
        // Create unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        // Upload to Storage Bucket
        const { error: uploadError } = await supabase.storage
            .from('studio-images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        statusText.innerText = "Saving to database...";

        // Get the Public URL
        const { data: publicUrlData } = supabase.storage
            .from('studio-images')
            .getPublicUrl(filePath);
            
        const imageUrl = publicUrlData.publicUrl;

        // Insert into Database
        const { error: dbError } = await supabase
            .from('gallery')
            .insert([{ 
                category: category, 
                description: description.trim() === "" ? null : description,
                image_url: imageUrl 
            }]);

        if (dbError) throw dbError;

        // Success Cleanup
        statusText.innerText = "Upload successful!";
        document.getElementById('uploadForm').reset();
        fetchGallery(); // Refresh the grid

    } catch (error) {
        console.error("Upload failed:", error.message);
        statusText.innerText = "Upload failed. Check console.";
    } finally {
        document.getElementById('uploadBtn').disabled = false;
        setTimeout(() => statusText.innerText = "", 3000);
    }
});

// 4. Handle Deleting a Photo
window.deletePhoto = async function(id, imageUrl) {
    if (!confirm("Are you sure you want to delete this photo? This cannot be undone.")) return;

    try {
        // Step A: Extract the exact file path from the URL to delete from Storage
        // URLs look like: .../public/studio-images/gallery/12345.jpg
        const urlParts = imageUrl.split('studio-images/');
        if (urlParts.length > 1) {
            const filePath = urlParts[1]; 
            const { error: storageError } = await supabase.storage
                .from('studio-images')
                .remove([filePath]);
            
            if (storageError) console.warn("Could not delete from storage:", storageError);
        }

        // Step B: Delete from the database using the unique ID
        const { error: dbError } = await supabase
            .from('gallery')
            .delete()
            .eq('id', id);

        if (dbError) throw dbError;

        alert("Photo deleted.");
        fetchGallery(); // Refresh the grid

    } catch (error) {
        console.error("Error deleting:", error.message);
        alert("Failed to delete photo. Check console.");
    }
};

// Load gallery when script runs
fetchGallery();
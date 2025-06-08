<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Upload File</title>
</head>
<body>
  <h1>Upload a File</h1>
  <form id="uploadForm" enctype="multipart/form-data">
    <input type="file" name="file" required />
    <button type="submit">Upload</button>
  </form>

  <div id="uploadResult"></div>

  <script>
    document.getElementById('uploadForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const token = localStorage.getItem('jwt_token');

      if (!token) {
        alert('Please log in first!');
        return;
      }

      try {
        const response = await fetch('/upload/gridfs', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        const result = await response.json();
        document.getElementById('uploadResult').innerText = result.message;
      } catch (error) {
        document.getElementById('uploadResult').innerText = 'Error uploading file';
        console.error('Error uploading file:', error);
      }
    });
  </script>
</body>
</html>

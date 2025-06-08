// Add a new document
app.post('/documents', authenticate, (req, res) => {
  const { name, type } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: 'Document name and type are required' });
  }

  const newDoc = { name, type };
  userDocuments.push(newDoc);

  res.status(201).json({ message: 'Document added successfully', document: newDoc });
});
